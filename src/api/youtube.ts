import api from '../lib/axios';
import type {
  CreateYoutubeUploadPayload,
  YoutubeAccountResponse,
  YoutubeSource,
  YoutubeUpload,
} from '../types';

export const youtubeApi = {
  account: () =>
    api.get<YoutubeAccountResponse>('/youtube/account').then((r) => r.data),

  authRedirect: () =>
    api.get<{ url: string }>('/youtube/auth/redirect').then((r) => r.data),

  disconnect: () =>
    api.post<{ message: string }>('/youtube/auth/disconnect').then((r) => r.data),

  sources: () =>
    api.get<{ sources: YoutubeSource[] }>('/youtube/sources').then((r) => r.data),

  uploads: () =>
    api.get<YoutubeUpload[]>('/youtube/uploads').then((r) => r.data),

  createUpload: (payload: CreateYoutubeUploadPayload) =>
    api.post<YoutubeUpload>('/youtube/uploads', payload).then((r) => r.data),

  cancelUpload: (id: number) =>
    api.delete<{ message: string }>(`/youtube/uploads/${id}`).then((r) => r.data),
};
