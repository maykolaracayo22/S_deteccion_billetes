export interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  original_pred?: any;
}

export interface PredictionResponse {
  ok: boolean;
  text: string;
  audio_url: string;
  audio_base64?: string;
  detections: Detection[];
  total_amount: number;
}

export interface ApiError {
  message: string;
  detail?: string;
}