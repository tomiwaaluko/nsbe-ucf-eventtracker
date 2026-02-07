'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Trash2, Upload } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  firstName: string;
  lastName: string;
  onPhotoUpdate: (photoUrl: string | null) => void;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  firstName,
  lastName,
  onPhotoUpdate,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please select an image smaller than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert('Invalid file type. Please select a JPEG, PNG, or WebP image');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${getApiUrl()}/members/me/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPhotoUrl(data.photoUrl);
      onPhotoUpdate(data.photoUrl);
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(`${getApiUrl()}/members/me/photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setPhotoUrl(undefined);
      onPhotoUpdate(null);
      alert('Profile photo deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} />
          <AvatarFallback className="text-4xl">
            {firstName?.[0]}{lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {photoUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>
        {photoUrl && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={uploading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Max size: 5MB • Formats: JPEG, PNG, WebP
      </p>
    </div>
  );
}
