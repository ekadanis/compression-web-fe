import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { FileCard } from '../components/FileCard';
import { filesApi } from '../api/files';
import type { File, PaginatedResponse } from '../types';
import { formatBytes } from '../lib/utils';

export function DashboardPage() {
  const [data, setData] = useState<PaginatedResponse<File> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await filesApi.list(page);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (fileId: number) => {
    if (!confirm('Delete this file and all its compressions?')) return;
    await filesApi.delete(fileId);
    load();
  };

  const files = data?.data ?? [];

  // Stats
  const totalFiles  = data?.total ?? 0;
  const audioCount  = files.filter(f => f.type === 'audio').length;
  const videoCount  = files.filter(f => f.type === 'video').length;
  const totalSize   = files.reduce((acc, f) => acc + (f.size ?? 0), 0);

  return (
    <AppLayout>
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your media files and compressions</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/upload')}>
            ⬆️ Upload File
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Files', value: totalFiles, icon: '📁' },
            { label: 'Videos', value: videoCount, icon: '🎬' },
            { label: 'Audio', value: audioCount, icon: '🎵' },
            { label: 'Total Size', value: formatBytes(totalSize), icon: '💾' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {icon}
              </div>
              <div>
                <p className="stat-value" style={{ fontSize: 22 }}>{value}</p>
                <p className="stat-label">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Files grid */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Recent Files
          </h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : files.length === 0 ? (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🎬</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>No files yet</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Upload your first audio or video file to get started
              </p>
              <button className="btn-primary" onClick={() => navigate('/upload')}>
                ⬆️ Upload Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {files.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClick={() => navigate(`/files/${file.id}`)}
                  onDelete={() => handleDelete(file.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => load(p)}
                  className={p === data.current_page ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px' }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
