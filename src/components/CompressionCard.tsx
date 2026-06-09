import type { Compression } from '../types';
import { formatBytes } from '../lib/utils';
import { Play, Download, Trash2 } from 'lucide-react';
import { compressionsApi } from '../api/compressions';

interface Props {
  compression: Compression;
  originalSize?: number;
  onPlay?: (compression: Compression) => void;
  onDelete?: (compression: Compression) => void;
}

const STATUS_CLASS: Record<string, string> = {
  processing: 'badge-processing',
  done: 'badge-done',
  failed: 'badge-failed',
};

export function CompressionCard({ compression, originalSize, onPlay, onDelete }: Props) {
  const reduction = originalSize && compression.size
    ? Math.round((1 - compression.size / originalSize) * 100)
    : null;
  const progress = Math.min(100, Math.max(0, Math.round(compression.progress ?? 0)));
  const canPreview = isPreviewableCompression(compression.format);

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await compressionsApi.download(compression);
  };

  return (
    <div className="glass-card p-7 fade-in">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{
            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700,
            color: '#c4b5fd', letterSpacing: '0.05em',
          }}>
            .{compression.format}
          </span>
          {compression.is_recommended && (
            <span style={{
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#6ee7b7',
            }}>
              ⭐ Recommended
            </span>
          )}
        </div>
        <span className={`badge ${STATUS_CLASS[compression.status] ?? 'badge-processing'}`}>
          {compression.status}
        </span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {compression.codec && (
          <Stat label="Codec" value={compression.codec} />
        )}
        {compression.size !== null && (
          <Stat label="File Size" value={formatBytes(compression.size)} />
        )}
        {reduction !== null && (
          <Stat
            label="Reduction"
            value={`${reduction}%`}
            valueStyle={{ color: reduction > 0 ? 'var(--success)' : 'var(--danger)' }}
          />
        )}
        {compression.bitrate && <Stat label="Video Bitrate" value={`${compression.bitrate} kbps`} />}
        {compression.resolution && <Stat label="Resolution" value={compression.resolution.replace(':', '×')} />}
        {compression.fps && <Stat label="FPS" value={String(compression.fps)} />}
        {compression.audio_bitrate && <Stat label="Audio Bitrate" value={`${compression.audio_bitrate} kbps`} />}
        {compression.sample_rate && <Stat label="Sample Rate" value={`${compression.sample_rate} Hz`} />}
        {compression.channel && <Stat label="Channel" value={compression.channel} />}
      </div>

      {/* Error */}
      {compression.status === 'failed' && compression.error_message && (
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, fontSize: 12, color: '#fca5a5',
        }}>
          ⚠️ {compression.error_message.substring(0, 120)}…
        </div>
      )}

      {compression.status === 'processing' && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>{progress > 0 ? 'Compressing...' : 'Starting compression...'}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          {compression.estimated_seconds_remaining !== null && compression.estimated_seconds_remaining !== undefined && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              Estimated finish: ~{formatRemaining(compression.estimated_seconds_remaining)} remaining
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {compression.status === 'done' && (
        <div style={{ marginTop: 18, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {compression.url && (
            <>
              {canPreview && compression.stream_url && (
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: 13, gap: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); onPlay?.(compression); }}
                >
                  <Play size={14} fill="currentColor" /> Play
                </button>
              )}

              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '8px 12px', fontSize: 13, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                onClick={handleDownload}
              >
                <Download size={14} /> Download
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Row */}
      <div style={{ marginTop: compression.status === 'processing' ? 0 : 8 }}>
        <button
          className="btn-danger"
          style={{ width: '100%', padding: '8px', fontSize: 13, gap: 6, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { e.stopPropagation(); onDelete?.(compression); }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

function formatRemaining(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;

  if (minutes <= 0) return `${rest}s`;
  if (minutes < 60) return `${minutes}m ${rest}s`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function isPreviewableCompression(format: string): boolean {
  return ['mp4', 'mkv', 'mov', 'mp3', 'wav', 'ogg', 'aac'].includes(format.toLowerCase());
}

function Stat({ label, value, valueStyle }: { label: string; value: string; valueStyle?: React.CSSProperties }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, ...valueStyle }}>
        {value}
      </p>
    </div>
  );
}
