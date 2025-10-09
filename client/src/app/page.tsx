'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { trackAPI, Track } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Plus, Search, Upload, Music } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { fetchTrackDuration } from '@/lib/audio';

export default function HomePage() {
  const { user } = useAuth();
  const { currentTrack, isPlaying, play, pause, addToQueue } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      console.log('Loading tracks...');
      const response = await trackAPI.getUserTracks();
      const base = Array.isArray(response.tracks) ? response.tracks : [];
      const withDurations = await Promise.all(
        base.map(async (t) => {
          if (!t.duration || t.duration <= 0) {
            try {
              const dur = await fetchTrackDuration(t.id);
              return { ...t, duration: dur } as Track;
            } catch (_) {
              return t;
            }
          }
          return t;
        })
      );
      console.log('Tracks loaded:', { count: withDurations.length });
      setTracks(withDurations);
    } catch (error: any) {
      console.error('Failed to load tracks:', error);
      toast.error(`Failed to load tracks: ${error.response?.data?.error || error.message}`);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        pause();
      } else {
        play(track);
      }
    } else {
      play(track, tracks);
    }
  };

  const handleAddToQueue = (track: Track) => {
    addToQueue(track);
    toast.success('Added to queue');
  };

  const safeTracks = Array.isArray(tracks) ? tracks : [];
  const filteredTracks = safeTracks.filter(track =>
    (track?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track?.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMinutes = Math.round(
    safeTracks.reduce((acc, track) => acc + (track.duration || 0), 0) / 60
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
              <p className="text-muted-foreground">Your personal music library</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeTracks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Artists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(safeTracks.map(t => t.artist)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMinutes} min</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracks */}
      <div className="container mx-auto px-4 pb-24">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No tracks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Upload your first track to get started'}
            </p>
            {!searchQuery && (
              <Link href="/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Track
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium truncate">
                      {track.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {Math.floor((track.duration || 0) / 60)}:{((track.duration || 0) % 60).toString().padStart(2, '0')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artist}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePlayTrack(track)}
                      className="flex-1"
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToQueue(track)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}