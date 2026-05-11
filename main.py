from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
import sqlite3
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from subtemas import SUBTEMAS_VALIDOS

app = FastAPI(title="Chatbot Pedagógico UNRaf - Detección Automática")

# Esquema simplificado: el subtema ya no es obligatorio enviarlo
class ChatRequest(BaseModel):
    user_id: str
    course_id: str
    role: str
    pregunta: str  # El usuario solo envía la duda

def clasificar_pregunta(pregunta_usuario: str):
    """
    Usa Ollama para determinar a qué subtema pertenece la pregunta.
    """
    prompt_clasificador = f"""
    Eres un clasificador de temas de Análisis Matemático. 
    Tu lista de temas permitidos es: {", ".join(SUBTEMAS_VALIDOS)}
    
    Analiza la siguiente pregunta del alumno: "{pregunta_usuario}"
    
    Responde ÚNICAMENTE con el nombre del tema de la lista que mejor se relacione. 
    Si la pregunta no tiene nada que ver con Análisis Matemático o con estos temas, responde "FUERA_DE_ESTRUCTURA".
    No des explicaciones, solo el nombre del tema.
    """
    
    response = ollama.generate(model='phi3', prompt=prompt_clasificador)
    tema_detectado = response['response'].strip()
    return tema_detectado

# Crear un ejecutor para que Ollama corra en un hilo separado
executor = ThreadPoolExecutor(max_workers=3)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    loop = asyncio.get_event_loop()
    try:
        # Prompt ultra-corto para que Phi-3 no de vueltas
        prompt = f"Pregunta: {request.pregunta}. Clasifica el subtema de Análisis Matemático y responde como tutor breve."
        
        # Ejecutamos Ollama de forma que FastAPI no se sienta "colgado"
        response = await loop.run_in_executor(
            executor, 
            lambda: ollama.generate(model='phi3', prompt=prompt)
        )
        
        respuesta_ia = response['response']
        
        # Registrar Log
        registrar_en_db(request, "Detección Automática", respuesta_ia)
        
        return {"respuesta": respuesta_ia}

    except Exception as e:
        print(f"Error detectado: {e}")
        return {"respuesta": "El servidor está procesando. Por favor, reintentá el envío."}

def registrar_en_db(req, tema, resp):
    conn = sqlite3.connect("logs_pedagogicos.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO chat_logs (user_id, course_id, role, subtema, pregunta, respuesta, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (req.user_id, req.course_id, req.role, tema, req.pregunta, resp, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()