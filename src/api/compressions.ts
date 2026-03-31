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

  compare: (fileId: number, ids: number[]) =>
    api.get<CompareResult>('/compressions/compare', {
      params: { file_id: fileId, ids },
    }).then(r => r.data),
};
