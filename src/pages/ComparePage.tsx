import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { compressionsApi } from '../api/compressions';
import type { CompareResult } from '../types';
import { formatBytes, formatDuration } from '../lib/utils';

export function ComparePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ids = searchParams.get('ids')?.split(',').map(Number).filter(Boolean) ?? [];
  const fileId = Number(id);

  useEffect(() => {
    if (!ids.length) { navigate(`/files/${fileId}`); return; }
    compressionsApi.compare(fileId, ids)
      .then(setResult)
      .catch(() => setError('Failed to load comparison data.'))
      .finally(() => setLoading(false));
  }, []);

  const orig = result?.original;

  return (
    <AppLayout>
      <div className="fade-in">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>Dashboard</button>
          <span>/</span>
          <button onClick={() => navigate(`/files/${fileId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>File Detail</button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>Compare</span>
        </div>

        <h1 className="page-title">Side-by-Side Comparison</h1>
        <p className="page-subtitle">Compare compressions against the original file</p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : error ? (
          <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: '#fca5a5' }}>⚠️ {error}</div>
        ) : result && (
          <div>
            {/* Original file info bar */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 10, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#93c5fd',
              }}>ORIGINAL</div>
              <div style={{ flex: 1, display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{orig?.name}</span>
                <span>{formatBytes(orig?.size)}</span>
                {orig?.duration && <span>⏱️ {formatDuration(orig.duration)}</span>}
                <span>{orig?.type?.toUpperCase()}</span>
              </div>
            </div>

            {/* Comparison table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.08em', padding: '0 16px 8px', width: 130 }}>
                      METRIC
                    </th>
                    <th style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '0 16px 8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: 6, padding: '3px 10px', color: '#93c5fd',
                        }}>
                          Original
                        </span>
                      </div>
                    </th>
                    {result.compressions.map(c => (
                      <th key={c.id} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '0 16px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{
                            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                            borderRadius: 6, padding: '3px 10px', color: '#c4b5fd',
                          }}>
                            .{c.format}
                          </span>
                          {c.is_recommended && <span style={{ fontSize: 10, color: '#6ee7b7' }}>⭐ Recommended</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: 'File Size',
                      original: formatBytes(orig?.size),
                      fmt: (c: typeof result.compressions[number]) => formatBytes(c.size),
                    },
                    {
                      label: 'Reduction',
                      original: '—',
                      fmt: (c: typeof result.compressions[number]) =>
                        c.size_reduction !== null ? (
                          <span style={{ color: (c.size_reduction ?? 0) > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                            {c.size_reduction}%
                          </span>
                        ) : '—',
                    },
                    {
                      label: 'Codec',
                      original: orig?.codec ?? '—',
                      fmt: (c: typeof result.compressions[number]) => c.codec ?? '—',
                    },
                    {
                      label: 'Bitrate',
                      original: orig?.bitrate ? `${orig.bitrate} kbps` : '—',
                      fmt: (c: typeof result.compressions[number]) => c.bitrate ? `${c.bitrate} kbps` : '—',
                    },
                    {
                      label: 'Resolution',
                      original: orig?.resolution?.replace(':', '×') ?? '—',
                      fmt: (c: typeof result.compressions[number]) => c.resolution?.replace(':', '×') ?? '—',
                    },
                    {
                      label: 'Audio Bitrate',
                      original: orig?.audio_bitrate ? `${orig.audio_bitrate} kbps` : '—',
                      fmt: (c: typeof result.compressions[number]) => c.audio_bitrate ? `${c.audio_bitrate} kbps` : '—',
                    },
                    {
                      label: 'Channel',
                      original: orig?.channel ?? '—',
                      fmt: (c: typeof result.compressions[number]) => c.channel ?? '—',
                    },
                  ].filter(m => {
                    if (m.label === 'Channel' && orig?.type === 'video') return false;
                    if (m.label === 'Resolution' && orig?.type === 'audio') return false;
                    return true;
                  })
                   .map(({ label, original, fmt }) => (
                    <tr key={label}>
                      <td style={{
                        padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
                        background: 'var(--bg-card)', borderRadius: '10px 0 0 10px',
                        border: '1px solid var(--border)', borderRight: 'none',
                      }}>
                        {label}
                      </td>
                      <td style={{
                        padding: '12px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none',
                      }}>
                        {original}
                      </td>
                      {result.compressions.map((c, i) => (
                        <td key={c.id} style={{
                          padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)', borderLeft: 'none',
                          borderRadius: i === result.compressions.length - 1 ? '0 10px 10px 0' : undefined,
                        }}>
                          {fmt(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Download row */}
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {result.compressions.map(c => (
                <a
                  key={c.id}
                  href={c.url}
                  download
                  className="btn-secondary"
                  style={{ textDecoration: 'none', fontSize: 13 }}
                >
                  ⬇️ Download .{c.format}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
