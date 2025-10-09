'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { playlistAPI, trackAPI, Playlist, Track } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Plus, ArrowLeft, Trash2, Music } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const { currentTrack, isPlaying, play, pause, addToQueue } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const playlistId = params.id as string;

  useEffect(() => {
    loadPlaylist();
    loadAvailableTracks();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      const playlistData = await playlistAPI.getPlaylist(playlistId);
      setPlaylist(playlistData);
    } catch (error) {
      toast.error('Failed to load playlist');
      router.push('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTracks = async () => {
    try {
      const response = await trackAPI.getUserTracks();
      setAvailableTracks(response.tracks);
    } catch (error) {
      toast.error('Failed to load tracks');
    }
  };

  const handlePlayPlaylist = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      play(playlist.tracks[0], playlist.tracks);
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
      play(track, playlist?.tracks || []);
    }
  };

  const handleAddTrack = async (trackId: string) => {
    setIsAdding(true);
    try {
      await playlistAPI.addTrack(playlistId, trackId);
      await loadPlaylist(); // Reload playlist to get updated tracks
      toast.success('Track added to playlist');
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add track');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!confirm('Remove this track from the playlist?')) {
      return;
    }

    try {
      await playlistAPI.removeTrack(playlistId, trackId);
      await loadPlaylist(); // Reload playlist to get updated tracks
      toast.success('Track removed from playlist');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove track');
    }
  };

  const handleAddToQueue = (track: Track) => {
    addToQueue(track);
    toast.success('Added to queue');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
          <Link href="/playlists">
            <Button>Back to Playlists</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tracksNotInPlaylist = availableTracks.filter(
    track => !playlist.tracks?.some(playlistTrack => playlistTrack.id === track.id)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/playlists">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{playlist.name}</h1>
                <p className="text-muted-foreground">
                  {playlist.description || 'No description'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tracks
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Tracks to Playlist</DialogTitle>
                    <DialogDescription>
                      Select tracks to add to "{playlist.name}"
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {tracksNotInPlaylist.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        All your tracks are already in this playlist
                      </p>
                    ) : (
                      tracksNotInPlaylist.map((track) => (
                        <div key={track.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddTrack(track.id)}
                            disabled={isAdding}
                          >
                            Add
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handlePlayPlaylist} disabled={!playlist.tracks?.length}>
                <Play className="h-4 w-4 mr-2" />
                Play All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Playlist Info */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="secondary">
            {playlist.tracks?.length || 0} tracks
          </Badge>
          <Badge variant="outline">
            {Math.round((playlist.tracks?.reduce((acc, track) => acc + track.duration, 0) || 0) / 60)} min total
          </Badge>
        </div>

        {/* Tracks */}
        {!playlist.tracks?.length ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No tracks in this playlist</h3>
            <p className="text-muted-foreground mb-4">
              Add some tracks to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tracks
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.tracks.map((track, index) => (
              <Card key={track.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-8">
                        {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayTrack(track)}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToQueue(track)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTrack(track.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
