import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, autoPlay = true, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (autoPlay && audioRef.current && audioUrl) {
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl, autoPlay]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        await audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Error controlling audio:', error);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className={`flex items-center gap-3 p-4 bg-gray-50 rounded-lg ${className}`}>
      <Volume2 className="w-5 h-5 text-gray-600" />
      
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="flex items-center justify-center w-10 h-10 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1">
        <p className="text-sm text-gray-600">Audio de respuesta</p>
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;