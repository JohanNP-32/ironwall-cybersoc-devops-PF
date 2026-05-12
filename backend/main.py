import logging
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId

# Crear carpeta de logs si no existe
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    filename="logs/audit.log", level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
)

app = FastAPI()

# CORS habilitado para que los frontends puedan comunicarse
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# --- CAMBIO IMPORTANTE: Usar 'database' en lugar de 'localhost' ---
MONGO_URL = os.getenv("MONGO_URL", "mongodb://database:27017/cybersoc")

try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    # Seleccionamos la base de datos 'cybersoc' explícitamente
    db = client["cybersoc"] 
    coleccion_incidentes = db["incidentes"]
    # Verificar conexión
    client.server_info() 
except Exception as e:
    logging.error(f"Error Mongo: {e}")
    print(f"ERROR CRÍTICO: No se pudo conectar a MongoDB en {MONGO_URL}")

# 1. Crear Ticket
@app.post("/api/incidentes/reportar")
async def reportar_incidente(request: Request):
    try:
        datos = await request.json()
        nuevo_incidente = {
            "entidad": datos.get("entidad", "Anónimo"),
            "tipo": datos.get("tipo", "Desconocido"),
            "severidad": datos.get("severidad", "medium"),
            "descripcion": datos.get("descripcion", "Sin detalles"),
            "estado": "Recibido",
            "fecha": datos.get("fecha", "Hoy")
        }
        resultado = coleccion_incidentes.insert_one(nuevo_incidente)
        ticket_id = str(resultado.inserted_id)
        logging.info(f"Ticket creado: {ticket_id}")
        return {"status": "success", "ticket_id": ticket_id}
    except Exception as e:
        logging.error(f"Error al reportar: {e}")
        return {"status": "error", "message": str(e)}

# 2. Consultar TODOS los tickets
@app.get("/api/incidentes")
async def obtener_incidentes():
    try:
        incidentes = []
        # Buscamos todos y convertimos ObjectId a string
        for inc in coleccion_incidentes.find({}):
            inc["_id"] = str(inc["_id"])
            incidentes.append(inc)
        return {"status": "success", "data": incidentes}
    except Exception as e:
        logging.error(f"Error al obtener incidentes: {e}")
        return {"status": "error"}

# 3. Consultar UN ticket por ID
@app.get("/api/incidentes/{ticket_id}")
async def obtener_un_incidente(ticket_id: str):
    try:
        inc = coleccion_incidentes.find_one({"_id": ObjectId(ticket_id)})
        if inc:
            inc["_id"] = str(inc["_id"])
            return {"status": "success", "data": inc}
        return {"status": "error", "message": "Ticket no encontrado"}
    except (InvalidId, Exception):
        return {"status": "error", "message": "ID Inválido o no encontrado"}

# 4. Actualizar Estado
@app.patch("/api/incidentes/{incidente_id}/estado")
async def actualizar_estado(incidente_id: str, request: Request):
    try:
        datos = await request.json()
        nuevo_estado = datos.get("estado")
        if not nuevo_estado:
            return {"status": "error", "message": "Falta el estado"}
            
        coleccion_incidentes.update_one(
            {"_id": ObjectId(incidente_id)},
            {"$set": {"estado": nuevo_estado}}
        )
        logging.info(f"Ticket {incidente_id} cambió a {nuevo_estado}.")
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error al actualizar estado: {e}")
        return {"status": "error"}