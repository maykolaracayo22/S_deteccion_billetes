from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import os

from app.api import routes
from config import settings

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Crear aplicación FastAPI
app = FastAPI(
    title="Asistente Visual de Billetes Peruanos",
    description="API para reconocimiento de billetes peruanos usando Roboflow",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Incluir rutas
app.include_router(routes.router)

@app.on_event("startup")
async def startup_event():
    """Tareas al iniciar la aplicación"""
    # Crear directorios necesarios
    os.makedirs("app/static/audio", exist_ok=True)
    os.makedirs("temp", exist_ok=True)
    
    logging.info("Aplicación iniciada correctamente")
    logging.info(f"Roboflow configurado: {bool(settings.ROBOFLOW_API_KEY)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )