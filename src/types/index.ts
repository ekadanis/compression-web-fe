export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface File {
  id: number;
  user_id: number;
  name: string;
  type: 'audio' | 'video';
  mime_type: string;
  original_path: string;
  size: number;
  duration: number | null;
  status: 'uploaded' | 'processing' | 'done' | 'failed';
  url?: string;
  compressions_count?: number;
  compressions?: Compression[];
  created_at: string;
  updated_at: string;
}

export interface Compression {
  id: number;
  file_id: number;
  format: string;
  codec: string | null;
  bitrate: number | null;
  resolution: string | null;
  fps: number | null;
  audio_bitrate: number | null;
  sample_rate: number | null;
  channel: string | null;
  size: number | null;
  path: string | null;
  url: string | null;
  is_recommended: boolean;
  status: 'processing' | 'done' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompareItem {
  id: number;
  format: string;
  codec: string | null;
  bitrate: number | null;
  resolution: string | null;
  fps: number | null;
  audio_bitrate: number | null;
  sample_rate: number | null;
  channel: string | null;
  size: number;
  url: string;
  is_recommended: boolean;
  size_reduction: number | null;
}

export interface CompareResult {
  original: {
    name: string;
    size: number;
    type: string;
    duration: number | null;
  };
  compressions: CompareItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateCompressionPayload {
  file_id: number;
  format: string;
  codec?: string;
  bitrate?: number;
  resolution?: string;
  fps?: number;
  audio_bitrate?: number;
  sample_rate?: number;
  channel?: string;
  is_recommended?: boolean;
}
