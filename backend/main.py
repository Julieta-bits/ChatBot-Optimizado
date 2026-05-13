from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import shutil
import os
# Forzamos a que el sistema reconozca la arquitectura RDNA2 de la RX 6600
os.environ["HSA_OVERRIDE_GFX_VERSION"] = "10.3.0"

# Opcional: Forzar a Ollama a usar la GPU si hay múltiples dispositivos
os.environ["OLLAMA_GPU_OVERHEAD"] = "1"
import ollama
import asyncio
from concurrent.futures import ThreadPoolExecutor
# Importamos las funciones desde tus otros archivos
from database import init_db, registrar_log
from subtemas import SUBTEMAS_VALIDOS
from models import ChatRequest, ChatResponse
from external_api import buscar_en_openstax

app = FastAPI(title="Chatbot Pedagógico UNRaf")
# Inicializamos la DB al arrancar
@app.on_event("startup")
def startup_event():
    init_db()

# Creamos una carpeta para los videos si no existe
os.makedirs("uploads", exist_ok=True)

class ChatRequest(BaseModel):
    user_id: str
    course_id: str
    role: str
    pregunta: str
    confidence: int = Field(..., ge=1, le=3)

# Limitamos hilos para no saturar el CPU con la IA local
executor = ThreadPoolExecutor(max_workers=3)

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

# Usamos el ejecutor para no bloquear el bucle de eventos de FastAPI
executor = ThreadPoolExecutor(max_workers=3)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    loop = asyncio.get_event_loop()
    print("1. Petición recibida...")
    print(f"2. Buscando tema: {request.pregunta}")
    # 1. Clasificar el tema para saber qué buscar en OpenStax
    tema_detectado = await loop.run_in_executor(executor, clasificar_pregunta, request.pregunta)
    
    print("3. Consultando OpenStax...")
    # 2. Obtener contexto de OpenStax basado en el tema o la pregunta
    # Ejecutamos la API en el executor para no bloquear el servidor
    contexto_web = await loop.run_in_executor(executor, buscar_en_openstax, tema_detectado)

    # 3. Preparar el Prompt para Phi-3 con la info de la página
    system_content = generar_system_prompt(request.confidence)
    full_prompt = f"""
    CONTEXTO ACADÉMICO (OpenStax):
    {contexto_web}
    
    PREGUNTA DEL ESTUDIANTE:
    {request.pregunta}
    
    Instrucción: Responde como un profesor usando el contexto académico proveído. 
    Si la información no es suficiente, usa tu conocimiento base pero prioriza el contexto.
    """
    print("4. Llamando a Ollama")
    # 4. Respuesta de la IA
    try:
        def call_ollama():
            return ollama.chat(
                model='phi3',
                messages=[
                    {'role': 'system', 'content': system_content},
                    {'role': 'user', 'content': full_prompt},
                ],
                options={'temperature': 0}
            )

        response = await loop.run_in_executor(executor, call_ollama)
        respuesta_final = response['message']['content']
        
        # 5. Registro en DB (para auditoría de la UNRaf)
        loop.run_in_executor(executor, registrar_log, request, tema_detectado, respuesta_final)
        
        return ChatResponse(tema=tema_detectado, respuesta=respuesta_final)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def clasificar_pregunta(pregunta):
    prompt = f"Clasifica: {pregunta} en {SUBTEMAS_VALIDOS} o FUERA_DE_ESTRUCTURA. Solo el nombre."
    response = ollama.generate(model='phi3', prompt=prompt)
    return response['response'].strip().split('\n')[0]