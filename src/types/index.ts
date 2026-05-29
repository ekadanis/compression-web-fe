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
  stream_url?: string | null;
  is_recommended: boolean;
  status: 'processing' | 'done' | 'failed';
  progress?: number;
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
    codec?: string | null;
    bitrate?: number | null;
    resolution?: string | null;
    audio_bitrate?: number | null;
    channel?: string | null;
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

export interface YoutubeAccount {
  id: number;
  user_id: number;
  google_email: string | null;
  channel_id: string | null;
  channel_title: string | null;
  scopes: string[] | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface YoutubeAccountResponse {
  connected: boolean;
  account: YoutubeAccount | null;
}

export interface YoutubeSource {
  source_type: 'file' | 'compression';
  source_id: number;
  label: string;
  file_name: string;
  mime_type: string;
  size: number | null;
  created_at: string;
}

export interface YoutubeUpload {
  id: number;
  user_id: number;
  uploadable_type: string;
  uploadable_id: number;
  platform: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  category_id: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  status: 'pending' | 'scheduled' | 'processing' | 'uploaded' | 'failed' | 'cancelled';
  progress: number;
  error_message: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  uploaded_at: string | null;
  external_id: string | null;
  url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateYoutubeUploadPayload {
  source_type: 'file' | 'compression';
  source_id: number;
  title: string;
  description?: string;
  tags?: string[];
  category_id?: string;
  visibility: 'private' | 'unlisted' | 'public';
  schedule_mode: 'now' | 'scheduled';
  scheduled_at?: string;
}

export interface SoundCloudAccount {
  id: number;
  user_id: number;
  soundcloud_user_id: string | null;
  username: string | null;
  permalink_url: string | null;
  avatar_url: string | null;
  scopes: string[] | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SoundCloudAccountResponse {
  connected: boolean;
  account: SoundCloudAccount | null;
}

export interface SoundCloudSource {
  source_type: 'file' | 'compression';
  source_id: number;
  label: string;
  file_name: string;
  mime_type: string;
  size: number | null;
  created_at: string;
}

export interface SoundCloudUpload {
  id: number;
  user_id: number;
  uploadable_type: string;
  uploadable_id: number;
  platform: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  category_id: string | null;
  visibility: 'private' | 'public';
  status: 'pending' | 'scheduled' | 'processing' | 'uploaded' | 'failed' | 'cancelled';
  progress: number;
  error_message: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  uploaded_at: string | null;
  external_id: string | null;
  url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSoundCloudUploadPayload {
  source_type: 'file' | 'compression';
  source_id: number;
  title: string;
  description?: string;
  tags?: string[];
  genre?: string;
  sharing: 'private' | 'public';
  schedule_mode: 'now' | 'scheduled';
  scheduled_at?: string;
}
