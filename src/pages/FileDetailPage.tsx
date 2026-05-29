import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { CompressionCard } from '../components/CompressionCard';
import { filesApi } from '../api/files';
import { compressionsApi } from '../api/compressions';
import type { File, Compression } from '../types';
import { formatBytes, formatDuration, formatDate } from '../lib/utils';

const STATUS_CLASS: Record<string, string> = {
  uploaded: 'badge-uploaded', processing: 'badge-processing',
  done: 'badge-done', failed: 'badge-failed',
};

export function FileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [compressions, setCompressions] = useState<Compression[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [playingMedia, setPlayingMedia] = useState<{ url: string; type: string } | null>(null);

  const handleDelete = async (compression: Compression) => {
    if (!confirm('Are you sure you want to delete this compression?')) return;
    try {
      await compressionsApi.delete(compression.id);
      setCompressions(prev => prev.filter(c => c.id !== compression.id));
      setSelectedIds(prev => prev.filter(cid => cid !== compression.id));
    } catch (err) {
      alert('Failed to delete compression.');
    }
  };

  const handlePlay = (compression: Compression) => {
    if (compression.stream_url) {
      setPlayingMedia({ url: compression.stream_url, type: file?.type ?? 'video' });
    }
  };

  const load = async () => {
    try {
      const f = await filesApi.get(Number(id));
      setFile(f);
      setCompressions(f.compressions ?? []);
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const shouldPoll = compressions.length === 0 || compressions.some((c) => c.status === 'processing');

    if (!shouldPoll) {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const fresh = await compressionsApi.listByFile(Number(id));
        setCompressions(fresh);
      } catch {
        // ignore transient polling errors
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [compressions, id]);

  const toggleSelect = (cid: number) => {
    setSelectedIds(prev =>
      prev.includes(cid) ? prev.filter(x => x !== cid) : [...prev, cid]
    );
  };

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    </AppLayout>
  );

  if (!file) return null;

  return (
    <AppLayout>
      <div className="fade-in">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
            Dashboard
          </button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{file.name}</span>
        </div>

        {/* File header */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(92,33,197,0.3))',
                border: '1px solid rgba(124,58,237,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>
                {file.type === 'audio' ? '🎵' : '🎬'}
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {file.name}
                </h1>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{file.type.toUpperCase()}</span>
                  <span>•</span>
                  <span>{formatBytes(file.size)}</span>
                  {file.duration && <><span>•</span><span>⏱️ {formatDuration(file.duration)}</span></>}
                  <span>•</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className={`badge ${STATUS_CLASS[file.status]}`}>{file.status}</span>
              {file.url && (
                <button 
                  className="btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }} 
                  onClick={() => setPlayingMedia({ url: file.url!, type: file.type })}
                >
                  ▶ Play Original
                </button>
              )}
              <button className="btn-primary" onClick={() => navigate(`/files/${file.id}/compress`)}>
                🗜️ New Compression
              </button>
              {selectedIds.length >= 2 && (
                <button className="btn-secondary" onClick={() =>
                  navigate(`/files/${file.id}/compare?ids=${selectedIds.join(',')}`)
                }>
                  ⚖️ Compare ({selectedIds.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compressions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              Compressions ({compressions.length})
            </h2>
            {compressions.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Select 2+ completed compressions to compare
              </p>
            )}
          </div>

          {compressions.length === 0 ? (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🗜️</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                No compressions yet
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Create your first compression to reduce the file size
              </p>
              <button className="btn-primary" onClick={() => navigate(`/files/${file.id}/compress`)}>
                🗜️ Start Compression
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {compressions.map(c => (
                <div
                  key={c.id}
                  style={{
                    position: 'relative',
                    outline: selectedIds.includes(c.id) ? '2px solid #7c3aed' : 'none',
                    borderRadius: 16,
                    cursor: c.status === 'done' ? 'pointer' : 'default',
                  }}
                  onClick={() => { if (c.status === 'done') toggleSelect(c.id); }}
                >
                  {selectedIds.includes(c.id) && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, zIndex: 1,
                      background: '#7c3aed', borderRadius: '50%', width: 22, height: 22,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: 'white',
                    }}>✓</div>
                  )}
                  <CompressionCard 
                    compression={c} 
                    originalSize={file.size} 
                    onDelete={handleDelete}
                    onPlay={handlePlay}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player Modal */}
      {playingMedia && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999, backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setPlayingMedia(null)}>
          <div style={{ background: '#111', padding: '20px 24px', borderRadius: 16, width: '100%', maxWidth: 800, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>▶ Now Playing</h3>
              <button onClick={() => setPlayingMedia(null)} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            {playingMedia.type === 'audio' ? (
              <audio src={playingMedia.url} controls autoPlay style={{ width: '100%', borderRadius: 8 }} />
            ) : (
              <video src={playingMedia.url} controls autoPlay style={{ width: '100%', borderRadius: 8, background: '#000', maxHeight: '70vh' }} />
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
