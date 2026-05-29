import api from '../lib/axios';
import type { Compression, CompareResult, CreateCompressionPayload } from '../types';

export const compressionsApi = {
  create: (data: CreateCompressionPayload) =>
    api.post<Compression>('/compressions', data).then(r => r.data),

  listByFile: (fileId: number) =>
    api.get<Compression[]>('/compressions', { params: { file_id: fileId } }).then(r => r.data),

  get: (id: number) =>
    api.get<Compression>(`/compressions/${id}`).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/compressions/${id}`),

  download: async (compression: Compression) => {
    const response = await api.get(`/compressions/${compression.id}/download`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });

    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const extension = compression.format ? `.${compression.format}` : '';
    const filename = `compressed_${compression.file_id}_${compression.id}${extension}`;

    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  },

  compare: (fileId: number, ids: number[]) =>
    api.get<CompareResult>('/compressions/compare', {
      params: { file_id: fileId, ids },
    }).then(r => r.data),
};
