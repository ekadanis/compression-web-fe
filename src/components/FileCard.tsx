import type { File } from '../types';
import { formatBytes, formatDate, fileTypeIcon } from '../lib/utils';

interface Props {
  file: File;
  onClick?: () => void;
  onDelete?: () => void;
}

const STATUS_CLASS: Record<string, string> = {
  uploaded: 'badge-uploaded',
  processing: 'badge-processing',
  done: 'badge-done',
  failed: 'badge-failed',
};

const STATUS_DOT: Record<string, string> = {
  uploaded: '●',
  processing: '◌',
  done: '●',
  failed: '●',
};

export function FileCard({ file, onClick, onDelete }: Props) {
  return (
    <div
      className="glass-card p-5 cursor-pointer fade-in"
      onClick={onClick}
      style={{ position: 'relative' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            {fileTypeIcon(file.type)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '180px',
            }}>
              {file.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {file.type.toUpperCase()} • {formatBytes(file.size)}
            </p>
          </div>
        </div>
        <span className={`badge ${STATUS_CLASS[file.status] ?? 'badge-uploaded'}`}>
          {STATUS_DOT[file.status]} {file.status}
        </span>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 16, paddingTop: 12,
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {file.compressions_count !== undefined && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              🗜️ {file.compressions_count} compression{file.compressions_count !== 1 ? 's' : ''}
            </span>
          )}
          {file.duration && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              ⏱️ {Math.round(file.duration)}s
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {formatDate(file.created_at)}
          </span>
          {onDelete && (
            <button
              className="btn-danger"
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
