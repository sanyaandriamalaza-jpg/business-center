import { UploadResponse } from "../app/api/upload-file/route";

export class UploadClient {
    private baseUrl: string = '/api/upload-file';

    async uploadSingle(file: File, folder?: string): Promise<UploadResponse> {
      const formData = new FormData();
      formData.append('image', file);
      if (folder) {
        formData.append('folder', folder);
      }

      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          body: formData,
        });

        return await response.json();
      } catch (error) {
        return {
          success: false,
          error: 'Erreur de réseau lors de l\'upload'
        };
      }
    }

    async uploadMultiple(files: File[], folders?: string[]): Promise<UploadResponse> {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('images', file);
      });

      if (folders) {
        folders.forEach(folder => {
          formData.append('folders', folder);
        });
      }

      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          body: formData,
        });

        return await response.json();
      } catch (error) {
        return {
          success: false,
          error: 'Erreur de réseau lors de l\'upload multiple'
        };
      }
    }
  }
