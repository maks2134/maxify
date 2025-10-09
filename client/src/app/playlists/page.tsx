'use client';

import React, { useState, useEffect } from 'react';
import { playlistAPI, Playlist } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Music, Play, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      console.log('Loading playlists...');
      const response = await playlistAPI.getUserPlaylists();
      console.log('Playlists loaded:', response);
      setPlaylists(Array.isArray(response.playlists) ? response.playlists : []);
    } catch (error: any) {
      console.error('Failed to load playlists:', error);
      toast.error(`Failed to load playlists: ${error.response?.data?.error || error.message}`);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating playlist:', { name: newPlaylistName, description: newPlaylistDescription });
      const playlist = await playlistAPI.create({
        name: newPlaylistName,
        description: newPlaylistDescription,
      });
      
      console.log('Playlist created:', playlist);
      setPlaylists(prev => [playlist, ...prev]);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setIsCreateDialogOpen(false);
      toast.success('Playlist created successfully');
    } catch (error: any) {
      console.error('Failed to create playlist:', error);
      toast.error(`Failed to create playlist: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await playlistAPI.deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      toast.success('Playlist deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete playlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading playlists...</p>
        </div>
      </div>
    );
  }

  const safePlaylists = Array.isArray(playlists) ? playlists : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Playlists</h1>
              <p className="text-muted-foreground">Manage your music collections</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline">Back to Library</Button>
              </Link>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Playlist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                    <DialogDescription>
                      Create a new playlist to organize your music
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Enter playlist name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        value={newPlaylistDescription}
                        onChange={(e) => setNewPlaylistDescription(e.target.value)}
                        placeholder="Enter playlist description"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button onClick={createPlaylist} disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Playlists */}
      <div className="container mx-auto px-4 py-8 pb-24">
        {safePlaylists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first playlist to organize your music
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {safePlaylists.map((playlist) => {
              const totalSeconds = (playlist.tracks || []).reduce((acc, t) => acc + (t?.duration || 0), 0);
              const totalMinutes = Math.round(totalSeconds / 60);
              return (
                <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{playlist.name}</CardTitle>
                        {playlist.description && (
                          <CardDescription className="text-sm mt-1 line-clamp-2">
                            {playlist.description}
                          </CardDescription>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{totalMinutes} min total</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {(playlist.tracks?.length || 0)} tracks
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/playlists/${playlist.id}`} className="flex-1">
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
