import requests
import time
import logging
from typing import Dict, Any, List, Tuple
from PIL import Image
import os

logger = logging.getLogger(__name__)

class RoboflowClient:
    def __init__(self, endpoint: str, api_key: str):
        self.endpoint = endpoint
        self.api_key = api_key
        self.timeout = 30

    def call_roboflow(self, image_path: str) -> Dict[str, Any]:
        """
        Envía imagen a Roboflow API con retry logic (FORMATO MULTIPART)
        """
        max_retries = 2
        base_delay = 1
        
        for attempt in range(max_retries + 1):
            try:
                print(f"🔍 Enviando imagen a Roboflow: {image_path}")
                print(f"🔍 Endpoint: {self.endpoint}")
                
                with open(image_path, 'rb') as image_file:
                    files = {'file': image_file}
                    params = {'api_key': self.api_key}
                    
                    response = requests.post(
                        self.endpoint,
                        files=files,
                        params=params,
                        timeout=self.timeout
                    )
                    
                    print(f"🔍 Status Code: {response.status_code}")
                    
                    if response.status_code == 200:
                        result = response.json()
                        print(f"✅ Respuesta de Roboflow recibida: {result}")
                        return result
                    elif response.status_code == 429:
                        logger.warning("Rate limit exceeded, retrying...")
                        if attempt < max_retries:
                            time.sleep(base_delay * (2 ** attempt))
                            continue
                    else:
                        logger.error(f"Roboflow API error: {response.status_code} - {response.text}")
                        print(f"❌ Error: {response.status_code} - {response.text}")
                        response.raise_for_status()
                        
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout en intento {attempt + 1}")
                if attempt < max_retries:
                    time.sleep(base_delay * (2 ** attempt))
                    continue
            except requests.exceptions.RequestException as e:
                logger.error(f"Error en la comunicación con Roboflow: {str(e)}")
                print(f"❌ Request Exception: {str(e)}")
                if attempt < max_retries:
                    time.sleep(base_delay * (2 ** attempt))
                    continue
                raise
        
        raise Exception("No se pudo conectar con Roboflow después de varios intentos")

    def get_image_size(self, image_path: str) -> Tuple[int, int]:
        """Obtiene dimensiones de la imagen"""
        with Image.open(image_path) as img:
            return img.size

    def parse_predictions(self, resp_json: Dict[str, Any], image_size: Tuple[int, int]) -> List[Dict]:
        """
        Parsea y normaliza las coordenadas de las detecciones
        """
        print(f"🔍 Parseando respuesta de Roboflow: {resp_json}")
        
        predictions = resp_json.get('predictions', [])
        normalized_predictions = []
        
        img_width, img_height = image_size
        
        print(f"🔍 Encontradas {len(predictions)} predicciones")
        
        for i, pred in enumerate(predictions):
            print(f"🔍 Predicción {i}: {pred}")
            
            # Roboflow puede devolver coordenadas normalizadas o en píxeles
            x = pred.get('x', 0)
            y = pred.get('y', 0)
            width = pred.get('width', 0)
            height = pred.get('height', 0)
            
            # Verificar si las coordenadas están normalizadas (0-1)
            if x <= 1 and y <= 1 and width <= 1 and height <= 1:
                # Desnormalizar coordenadas
                x = x * img_width
                y = y * img_height
                width = width * img_width
                height = height * img_height
            
            # Calcular bounding box
            left = x - width / 2
            top = y - height / 2
            right = x + width / 2
            bottom = y + height / 2
            
            normalized_predictions.append({
                'class': pred.get('class', ''),
                'confidence': pred.get('confidence', 0),
                'bbox': [left, top, right, bottom],
                'original_pred': pred  # Mantener datos originales
            })
            
            print(f"🔍 Clase: '{pred.get('class', '')}', Confianza: {pred.get('confidence', 0)}")
        
        print(f"✅ Predicciones normalizadas: {len(normalized_predictions)}")
        return normalized_predictions