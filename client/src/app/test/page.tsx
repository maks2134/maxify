'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trackAPI, playlistAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing API...\n');
    
    try {
      setTestResult(prev => prev + 'Testing tracks API...\n');
      const tracksResponse = await trackAPI.getUserTracks();
      setTestResult(prev => prev + `Tracks: ${JSON.stringify(tracksResponse, null, 2)}\n`);
      
      setTestResult(prev => prev + 'Testing playlists API...\n');
      const playlistsResponse = await playlistAPI.getUserPlaylists();
      setTestResult(prev => prev + `Playlists: ${JSON.stringify(playlistsResponse, null, 2)}\n`);
      
      setTestResult(prev => prev + 'Testing create playlist...\n');
      const newPlaylist = await playlistAPI.create({
        name: `Test Playlist ${Date.now()}`,
        description: 'Test playlist created from test page'
      });
      setTestResult(prev => prev + `Created playlist: ${JSON.stringify(newPlaylist, null, 2)}\n`);
      
      toast.success('API test completed successfully!');
    } catch (error: any) {
      console.error('API test error:', error);
      setTestResult(prev => prev + `Error: ${error.message}\n`);
      setTestResult(prev => prev + `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`);
      toast.error('API test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setTestResult('');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testAPI} disabled={isLoading}>
                {isLoading ? 'Testing...' : 'Test API'}
              </Button>
              <Button variant="outline" onClick={clearResult}>
                Clear
              </Button>
            </div>
            
            {testResult && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
                  {testResult}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
