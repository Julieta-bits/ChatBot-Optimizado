from fastapi import FastAPI, HTTPException, Request
import hashlib
from pydantic import BaseModel, Field
import os
import ollama
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Importaciones de tus módulos locales
from database import init_db, registrar_log
from subtemas import SUBTEMAS_VALIDOS
from models import ChatResponse # Mantenemos ChatResponse de models
from busqueda_local import buscar_en_pdf

app = FastAPI(title="Chatbot Pedagógico UNRaf")

# --- CONFIGURACIÓN DE CONCURRENCIA ---
executor = ThreadPoolExecutor(max_workers=3)

# --- MODELOS DE DATOS ---
# Definimos ChatRequest aquí mismo para evitar confusiones de importación
class ChatRequest(BaseModel):
    user_id: str
    course_id: str
    role: str
    pregunta: str
    confidence: int = Field(..., ge=1, le=3)

def hashear_usuario(username: str):
    return hashlib.sha256(username.encode()).hexdigest()

@app.on_event("startup")
def startup_event():
    init_db()
    os.makedirs("uploads", exist_ok=True)

def generar_system_prompt(confidence):
    base_prompt = """Eres un profesor universitario argentino de matemáticas, riguroso, paciente y preciso.
Tu tarea es ayudar al estudiante utilizando exclusivamente la información contenida en el contexto proporcionado.
Reglas obligatorias:
1. No utilices conocimientos externos al contexto. 
2. No agregues resultados no justificados. 
3. Si la respuesta no puede deducirse del material dado, debes decir exactamente: "No puedo responder a esto basándome en el material proporcionado." 
4. No inventes pasos ni resultados. 
5. Si el problema requiere cálculo, explicita primero la estrategia antes de ejecutar el procedimiento."""

    niveles = {
        1: "\nNivel 1 (básico): Explica definiciones, paso a paso detallado, justifica cada transformación y pregunta de control final.",
        2: "\nNivel 2 (intermedio): Enuncia idea clave y estrategia, resuelve sin detalles elementales, señala errores frecuentes.",
        3: "\nNivel 3 (avanzado): Directo a la estrategia, justificaciones sintéticas, incluye equivalencias formales."
    }
    return f"{base_prompt}{niveles[confidence]}\nRespuestas formales y sin motivaciones innecesarias."

def clasificar_pregunta(pregunta):
    prompt = f"Clasifica: {pregunta} en {SUBTEMAS_VALIDOS} o FUERA_DE_ESTRUCTURA. Solo el nombre."
    response = ollama.generate(model='phi3', prompt=prompt)
    return response['response'].strip().split('\n')[0]

# --- ENDPOINT PRINCIPAL ---
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_data: ChatRequest, request: Request):
    loop = asyncio.get_event_loop()
    # ^^^ EXPLICACIÓN: 'chat_data' recibe el JSON, 'request' detecta la conexión de red.
    
    loop = asyncio.get_event_loop()
    
    print(f"1. Petición recibida de: {chat_data.user_id}")

    # --- PROCESO DE HASHING ---
    user_hash = hashear_usuario(chat_data.user_id)
    print(f"2. Guardando actividad bajo hash: {user_hash}")
    
    # --- LÓGICA DE PROCESAMIENTO ---
    print(f"3. Clasificando tema...")
    tema_detectado = await loop.run_in_executor(executor, clasificar_pregunta, chat_data.pregunta)
    
    # --- LIMPIEZA CRÍTICA PARA EL RAG ---
    tema_para_buscar = str(tema_detectado)
    # 1. Recorte por estructura si viene con explicaciones largas
    if ":" in tema_para_buscar:
        tema_para_buscar = tema_para_buscar.split(":")[0].strip()
    # 2. Filtrado radical: Dejamos SOLO letras, números, espacios y guiones bajos estándar
    # Chau emojis, chau guiones de lista (-), viñetas, llaves, comillas, etc.
    tema_para_buscar = "".join(c for c in tema_para_buscar if c.isalnum() or c in [" ", "_"]).strip()
    # 3. Recorte por longitud (máximo 4 palabras para no marear al buscador)
    palabras = tema_para_buscar.split()
    tema_para_buscar = " ".join(palabras[:4]).strip()
    # 4. Por seguridad, si quedó un guion bajo colgado al inicio o final por la limpieza, lo barremos
    tema_para_buscar = tema_para_buscar.strip("_").strip()

    # --- BÚSQUEDA LOCAL EN PDF (RAG) ---
    print(f"4. Consultando PDF local para: {tema_para_buscar}...")
    contexto_pdf = await loop.run_in_executor(executor, buscar_en_pdf, tema_para_buscar)

    system_content = generar_system_prompt(chat_data.confidence)
    
    if contexto_pdf:
        fuente_info = "PDF LOCAL (Inglés)"
        full_prompt = f"""
        TECHNICAL CONTEXT (From English Textbook):
        {contexto_pdf}
        
        INSTRUCCIÓN: Utiliza el contexto anterior en inglés para responder la duda del alumno en ESPAÑOL.
        PREGUNTA DEL ESTUDIANTE: {chat_data.pregunta}
        """
    else:
        fuente_info = "CONOCIMIENTO GENERAL"
        full_prompt = chat_data.pregunta
    
    print(f"5. Llamando a Ollama (Modo: {fuente_info})...")

    def call_ollama():
        # Usamos la API de chat pero con un identificador o simplemente 
        # confiamos en que al cerrar el socket local, Ollama debería notar la presión, 
        # pero para ser agresivos, usaremos un timeout.
        return ollama.chat(
            model='phi3', 
            messages=[
                {'role': 'system', 'content': system_content},
                {'role': 'user', 'content': full_prompt},
            ],
            options={'temperature': 0, 'num_predict': 500, 'keep_alive': 0}
        )

    try:
        task = loop.run_in_executor(executor, call_ollama)

        while not task.done():
            if await request.is_disconnected():
                print("!!! CLIENTE DESCONECTADO: Forzando parada de Ollama...")
                
                # --- SOLUCIÓN RADICAL ---
                # Enviamos una petición vacía o intentamos matar el proceso 
                # En Ollama, la mejor forma es simplemente dejar de leer, 
                # pero si querés liberar la RAM YA:
                task.cancel()
                
                # Intentamos avisarle a la API local de Ollama que aborte
                try:
                    # Esto intenta "pisar" la tarea anterior generando algo vacío
                    requests.post("http://localhost:11434/api/generate", 
                                  json={"model": "phi3", "keep_alive": 0})
                except:
                    pass
                
                return None 
            await asyncio.sleep(0.5)

        response = await task
        respuesta_final = response['message']['content']
        
        # --- REGISTRO EN DB ---
        # Pasamos una copia de chat_data con el ID hasheado para el log
        chat_data_log = chat_data.copy(update={"user_id": user_hash})
        await loop.run_in_executor(
            executor, 
            registrar_log, 
            chat_data_log,
            tema_detectado, 
            respuesta_final
        )
        
        print(f"6. Respuesta enviada. Fuente: {fuente_info}")
        return ChatResponse(tema=tema_detectado, respuesta=respuesta_final)

    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
def shutdown_event():
    print("Cerrando servidor... Matando procesos colgados de Ollama.")
    executor.shutdown(wait=False)
    # OPCIONAL: Si estás en Windows y querés matar a Ollama al cerrar todo
    # os.system("taskkill /IM ollama_llama_server.exe /F")