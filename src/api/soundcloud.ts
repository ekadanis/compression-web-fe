import api from '../lib/axios';
import type {
  CreateSoundCloudUploadPayload,
  SoundCloudAccountResponse,
  SoundCloudSource,
  SoundCloudUpload,
} from '../types';

export const soundcloudApi = {
  account: () =>
    api.get<SoundCloudAccountResponse>('/soundcloud/account').then((r) => r.data),

  authRedirect: () =>
    api.get<{ url: string }>('/soundcloud/auth/redirect').then((r) => r.data),

  disconnect: () =>
    api.post<{ message: string }>('/soundcloud/auth/disconnect').then((r) => r.data),

  sources: () =>
    api.get<{ sources: SoundCloudSource[] }>('/soundcloud/sources').then((r) => r.data),

  uploads: () =>
    api.get<SoundCloudUpload[]>('/soundcloud/uploads').then((r) => r.data),

  createUpload: (payload: CreateSoundCloudUploadPayload) =>
    api.post<SoundCloudUpload>('/soundcloud/uploads', payload).then((r) => r.data),

  cancelUpload: (id: number) =>
    api.delete<{ message: string }>(`/soundcloud/uploads/${id}`).then((r) => r.data),
};
