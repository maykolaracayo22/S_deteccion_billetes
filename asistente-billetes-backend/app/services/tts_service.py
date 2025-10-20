from gtts import gTTS
import base64
import os
import uuid
import aiofiles
from typing import Tuple
import logging
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self, audio_dir: str, host_url: str, ttl_minutes: int = 60):
        self.audio_dir = audio_dir
        self.host_url = host_url.rstrip('/')
        self.ttl_minutes = ttl_minutes
        os.makedirs(audio_dir, exist_ok=True)

    async def text_to_audio(self, text: str) -> Tuple[str, str]:
        """
        Convierte texto a audio usando gTTS
        Retorna: (filepath, audio_url)
        """
        try:
            # Generar nombre único para el archivo
            filename = f"{uuid.uuid4()}.mp3"
            filepath = os.path.join(self.audio_dir, filename)
            
            # Generar audio con gTTS
            tts = gTTS(text=text, lang='es', slow=False)
            tts.save(filepath)
            
            # Construir URL pública
            audio_url = f"{self.host_url}/static/audio/{filename}"
            
            logger.info(f"Audio generado: {filepath}")
            return filepath, audio_url
            
        except Exception as e:
            logger.error(f"Error generando audio TTS: {str(e)}")
            raise

    async def audio_to_base64(self, filepath: str) -> str:
        """Convierte archivo de audio a base64"""
        try:
            async with aiofiles.open(filepath, 'rb') as audio_file:
                audio_data = await audio_file.read()
                return base64.b64encode(audio_data).decode('utf-8')
        except Exception as e:
            logger.error(f"Error convirtiendo audio a base64: {str(e)}")
            return ""

    async def cleanup_old_audio_files(self):
        """Elimina archivos de audio antiguos"""
        try:
            current_time = datetime.now()
            for filename in os.listdir(self.audio_dir):
                filepath = os.path.join(self.audio_dir, filename)
                if os.path.isfile(filepath):
                    file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
                    if current_time - file_time > timedelta(minutes=self.ttl_minutes):
                        os.remove(filepath)
                        logger.info(f"Archivo antiguo eliminado: {filename}")
        except Exception as e:
            logger.error(f"Error en limpieza de archivos de audio: {str(e)}")