'use client';

import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
  } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{currentTrack.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={previous}>
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={togglePlayPause}>
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={next}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32">
          <Button variant="ghost" size="sm" onClick={() => setVolume(volume > 0 ? 0 : 1)}>
            {volume > 0 ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
