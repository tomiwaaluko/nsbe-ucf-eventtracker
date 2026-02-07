import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin access
    );
  }

  async uploadProfilePhoto(
    memberId: string,
    file: Buffer,
    mimeType: string,
  ): Promise<string> {
    const fileExt = mimeType.split('/')[1];
    const fileName = `${memberId}-${Date.now()}.${fileExt}`;
    const filePath = `${memberId}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload photo: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async deleteProfilePhoto(photoUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(photoUrl);
      const filePath = url.pathname.split('/profile-photos/')[1];

      if (filePath) {
        await this.supabase.storage.from('profile-photos').remove([filePath]);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Don't throw error if deletion fails, just log it
    }
  }
}
