import api from '../lib/axios';
import type { File, PaginatedResponse } from '../types';

export const filesApi = {
  list: (page = 1) =>
    api.get<PaginatedResponse<File>>('/files', { params: { page } }).then(r => r.data),

  get: (id: number) =>
    api.get<File>(`/files/${id}`).then(r => r.data),

  upload: (file: globalThis.File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<File>('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }).then(r => r.data);
  },

  delete: (id: number) =>
    api.delete(`/files/${id}`).then(r => r.data),
};
