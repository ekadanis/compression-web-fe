import api from '../lib/axios';
import type { File, PaginatedResponse } from '../types';

export interface FileListParams {
  page?: number;
  type?: 'all' | 'audio' | 'video';
  sort?: 'updated_desc' | 'updated_asc' | 'name_asc' | 'name_desc';
  search?: string;
}

export interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
}

export const filesApi = {
  list: (params: FileListParams = {}) =>
    api.get<PaginatedResponse<File>>('/files', { params: { page: 1, ...params } }).then(r => r.data),

  get: (id: number) =>
    api.get<File>(`/files/${id}`).then(r => r.data),

  upload: (file: globalThis.File, onProgress?: (progress: UploadProgress) => void) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<File>('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress({
            percent: Math.round((e.loaded * 100) / e.total),
            loaded: e.loaded,
            total: e.total,
          });
        }
      },
    }).then(r => r.data);
  },

  delete: (id: number) =>
    api.delete(`/files/${id}`).then(r => r.data),
};
