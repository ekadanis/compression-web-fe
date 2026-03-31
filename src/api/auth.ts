import api from '../lib/axios';
import type { AuthResponse } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),

  me: () =>
    api.get('/auth/me').then(r => r.data),
};
