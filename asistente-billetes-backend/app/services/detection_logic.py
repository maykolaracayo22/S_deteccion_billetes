from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

# Mapeo de clases a valores monetarios
CLASS_MAPPING = {
    "S10": 10,
    "S20": 20, 
    "S50": 50,
    "S100": 100,
    "S200": 200
}

class DetectionProcessor:
    def __init__(self, confidence_threshold: float = 0.4):
        self.confidence_threshold = confidence_threshold

    def filter_valid_detections(self, detections: List[Dict]) -> List[Dict]:
        """Filtra detecciones por confidence threshold"""
        return [det for det in detections if det['confidence'] >= self.confidence_threshold]

    def group_detections_by_class(self, detections: List[Dict]) -> Dict[str, List[Dict]]:
        """Agrupa detecciones por clase"""
        grouped = {}
        for det in detections:
            class_name = det['class']
            if class_name not in grouped:
                grouped[class_name] = []
            grouped[class_name].append(det)
        return grouped

    def calculate_total_amount(self, grouped_detections: Dict[str, List[Dict]]) -> int:
        """Calcula el monto total de los billetes detectados"""
        total = 0
        for class_name, detections in grouped_detections.items():
            if class_name in CLASS_MAPPING:
                total += CLASS_MAPPING[class_name] * len(detections)
        return total

    def generate_detection_text(self, grouped_detections: Dict[str, List[Dict]], total_amount: int) -> str:
        """Genera texto descriptivo de las detecciones"""
        if not grouped_detections:
            return "No se detectó billete"
        
        # Contar billetes por denominación
        counts = {}
        for class_name, detections in grouped_detections.items():
            if class_name in CLASS_MAPPING:
                value = CLASS_MAPPING[class_name]
                counts[value] = len(detections)
        
        if not counts:
            return "No se detectó billete válido"
        
        # Generar texto según la cantidad de tipos de billetes
        if len(counts) == 1:
            # Un solo tipo de billete
            value, count = list(counts.items())[0]
            if count == 1:
                return f"Se detectó 1 billete de {value} soles"
            else:
                return f"Se detectaron {count} billetes de {value} soles"
        else:
            # Múltiples tipos de billetes
            parts = []
            for value, count in sorted(counts.items()):
                if count == 1:
                    parts.append(f"1 de {value}")
                else:
                    parts.append(f"{count} de {value}")
            
            denominations_text = ", ".join(parts)
            return f"Se detectaron billetes: {denominations_text}. Total: {total_amount} soles"

    def process_detections(self, detections: List[Dict]) -> Dict:
        """Procesa todas las detecciones y genera resultado final"""
        # Filtrar detecciones válidas
        valid_detections = self.filter_valid_detections(detections)
        
        if not valid_detections:
            return {
                'ok': False,
                'text': "No se detectó billete",
                'detections': [],
                'total_amount': 0,
                'grouped_detections': {}
            }
        
        # Agrupar por clase
        grouped_detections = self.group_detections_by_class(valid_detections)
        
        # Calcular monto total
        total_amount = self.calculate_total_amount(grouped_detections)
        
        # Generar texto descriptivo
        detection_text = self.generate_detection_text(grouped_detections, total_amount)
        
        # Encontrar detección principal (mayor confidence)
        main_detection = max(valid_detections, key=lambda x: x['confidence'])
        
        return {
            'ok': True,
            'text': detection_text,
            'detections': valid_detections,
            'total_amount': total_amount,
            'grouped_detections': grouped_detections,
            'main_detection': main_detection
        }