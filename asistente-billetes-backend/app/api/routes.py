from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
import os
import uuid
import aiofiles
from typing import Optional
import logging

from app.services.roboflow_client import RoboflowClient
from app.services.detection_logic import DetectionProcessor
from app.services.tts_service import TTSService
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Inicializar servicios
roboflow_client = RoboflowClient(
    endpoint=settings.ROBOFLOW_ENDPOINT,
    api_key=settings.ROBOFLOW_API_KEY
)

detection_processor = DetectionProcessor(
    confidence_threshold=settings.CONFIDENCE_THRESHOLD
)

tts_service = TTSService(
    audio_dir="app/static/audio",
    host_url=settings.HOST_URL,
    ttl_minutes=settings.AUDIO_TTL_MINUTES
)

async def verify_api_key(authorization: Optional[str] = Header(None)):
    """Middleware para verificar API key"""
    if not settings.APP_API_KEY or settings.APP_API_KEY == "default-secret-key":
        return True  # No hay seguridad configurada
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        if token != settings.APP_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API key")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

@router.post("/api/v1/predict")
async def predict_bill(
    file: UploadFile = File(...),
    include_base64: bool = False,
    _: bool = Depends(verify_api_key)
):
    """
    Endpoint para detectar billetes en una imagen
    """
    try:
        # Validar tipo de archivo
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

        # Guardar imagen temporalmente
        temp_dir = "temp"
        os.makedirs(temp_dir, exist_ok=True)
        temp_filename = f"{uuid.uuid4()}_{file.filename}"
        temp_path = os.path.join(temp_dir, temp_filename)

        try:
            # Guardar archivo temporal
            async with aiofiles.open(temp_path, 'wb') as temp_file:
                content = await file.read()
                await temp_file.write(content)

            # 1. Obtener tamaño de la imagen
            image_size = roboflow_client.get_image_size(temp_path)

            # 2. Llamar a Roboflow API
            roboflow_response = roboflow_client.call_roboflow(temp_path)

            # 3. Parsear predicciones
            detections = roboflow_client.parse_predictions(roboflow_response, image_size)

            # 4. Procesar detecciones
            result = detection_processor.process_detections(detections)

            # 5. Generar audio TTS
            audio_filepath, audio_url = await tts_service.text_to_audio(result['text'])

            # 6. Opcional: convertir audio a base64
            audio_base64 = None
            if include_base64:
                audio_base64 = await tts_service.audio_to_base64(audio_filepath)

            # 7. Preparar respuesta
            response_data = {
                "ok": result['ok'],
                "text": result['text'],
                "audio_url": audio_url,
                "detections": result['detections'],
                "total_amount": result['total_amount']
            }

            if audio_base64:
                response_data["audio_base64"] = audio_base64

            return JSONResponse(content=response_data)

        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        logger.error(f"Error en endpoint predict: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")

@router.get("/api/v1/health")
async def health_check():
    """Endpoint de salud del servicio"""
    health_status = {
        "status": "healthy",
        "roboflow_configured": bool(settings.ROBOFLOW_API_KEY and settings.ROBOFLOW_ENDPOINT),
        "confidence_threshold": settings.CONFIDENCE_THRESHOLD
    }
    return health_status

@router.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Asistente Visual de Billetes Peruanos",
        "version": "1.0.0",
        "docs": "/docs"
    }