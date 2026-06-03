import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { filesApi } from '../api/files';
import { formatBytes } from '../lib/utils';

const ALLOWED = ['mp4', 'mkv', 'avi', 'mov', 'mp3', 'wav', 'aac', 'ogg', 'm4a'];

export function UploadPage() {
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const validate = (f: globalThis.File): string => {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED.includes(ext)) return `File type .${ext} is not supported.`;
    if (f.size > 512 * 1024 * 1024 * 1024) return 'File exceeds 512 MB limit.';
    return '';
  };

  const pick = (f: globalThis.File) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pick(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setProgress(0); setError('');
    try {
      const uploaded = await filesApi.upload(file, setProgress);
      navigate(`/files/${uploaded.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const isVideo = (name: string) => ['mp4','mkv','avi','mov'].includes(name.split('.').pop()?.toLowerCase() ?? '');

  return (
    <AppLayout>
      <div className="fade-in" style={{ maxWidth: 620 }}>
        <h1 className="page-title">Upload File</h1>
        <p className="page-subtitle">Supported: MP4, MKV, AVI, MOV, MP3, WAV, AAC, OGG · Max 512 MB</p>

        {/* Dropzone */}
        <div
          className={`dropzone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{ marginBottom: 24 }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*,audio/*,.mkv,.aac,.ogg"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) pick(f); }}
          />

          {file ? (
            <div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {isVideo(file.name) ? '🎬' : '🎵'}
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {file.name}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {formatBytes(file.size)} · Click to change
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 48, marginBottom: 12 }}>☁️</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                Drag & drop your file here
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                or click to browse
              </p>
              <span className="btn-secondary" style={{ display: 'inline-flex' }}>
                Browse Files
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#fca5a5', marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Uploading…</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd' }}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? <><span className="spinner" /> Uploading…</> : '⬆️ Upload File'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </div>
    </AppLayout>
  );
}
