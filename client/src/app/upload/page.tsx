'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { trackAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Music, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a']
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const fileItem of pendingFiles) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          ));
        }, 200);

        await trackAPI.upload(fileItem.file);

        clearInterval(progressInterval);
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ));

        toast.success(`Uploaded: ${fileItem.file.name}`);
      } catch (error: any) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error.response?.data?.error || 'Upload failed' 
              }
            : f
        ));
        toast.error(`Failed to upload: ${fileItem.file.name}`);
      }
    }

    setIsUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <Music className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Upload Music</h1>
              <p className="text-muted-foreground">Add new tracks to your library</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Library</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Select Audio Files</CardTitle>
              <CardDescription>
                Drag and drop your audio files here, or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">Drag & drop audio files here</p>
                    <p className="text-sm text-muted-foreground">
                      Supports MP3, WAV, FLAC, AAC, OGG, M4A
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected Files ({files.length})</CardTitle>
                  <Button 
                    onClick={uploadFiles} 
                    disabled={isUploading || files.every(f => f.status !== 'pending')}
                  >
                    {isUploading ? 'Uploading...' : 'Upload All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((fileItem) => (
                    <div key={fileItem.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(fileItem.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        {fileItem.error && (
                          <p className="text-sm text-red-500">{fileItem.error}</p>
                        )}
                      </div>

                      {fileItem.status === 'uploading' && (
                        <div className="flex-1 max-w-xs">
                          <Progress value={fileItem.progress} className="h-2" />
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileItem.id)}
                        disabled={fileItem.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A</p>
              <p>• Maximum file size: 50MB per file</p>
              <p>• Metadata (title, artist) will be extracted from the file</p>
              <p>• You can upload multiple files at once</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
