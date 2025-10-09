'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '@/lib/api';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  currentIndex: number;
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime || 0);
      });
      
      audio.addEventListener('ended', () => {
        next();
      });
      
      audio.addEventListener('volumechange', () => {
        setVolume(audio.volume);
      });
      
      return () => {
        audio.pause();
        audio.src = '';
        if (currentObjectUrlRef.current) {
          URL.revokeObjectURL(currentObjectUrlRef.current);
          currentObjectUrlRef.current = null;
        }
      };
    }
  }, []);

  const loadAndPlayWithAuth = async (track: Track) => {
    if (!audioRef.current) return;

    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
      currentObjectUrlRef.current = null;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const url = `${baseUrl}/tracks/${track.id}/stream`;

    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!resp.ok) {
      throw new Error(`Failed to load stream: ${resp.status}`);
    }

    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    currentObjectUrlRef.current = objectUrl;

    audioRef.current.src = objectUrl;
    await audioRef.current.play();
    setIsPlaying(true);
  };

  const play = (track: Track, newQueue?: Track[]) => {
    if (newQueue) {
      setQueue(newQueue);
      setCurrentIndex(newQueue.findIndex(t => t.id === track.id));
    }
    setCurrentTrack(track);
    loadAndPlayWithAuth(track).catch(() => {
      setIsPlaying(false);
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const next = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextTrack = queue[nextIndex];
      setCurrentTrack(nextTrack);
      loadAndPlayWithAuth(nextTrack).catch(() => setIsPlaying(false));
    }
  };

  const previous = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevTrack = queue[prevIndex];
      setCurrentTrack(prevTrack);
      loadAndPlayWithAuth(prevTrack).catch(() => setIsPlaying(false));
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeHandler = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
  };

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    seek,
    setVolume: setVolumeHandler,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
