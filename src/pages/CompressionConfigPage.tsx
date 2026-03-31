import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { compressionsApi } from '../api/compressions';

// Config options
const VIDEO_FORMATS = ['mp4', 'mkv', 'avi', 'mov'];
const AUDIO_FORMATS = ['mp3', 'wav', 'aac', 'ogg'];
const VIDEO_CODECS = ['libx264', 'libx265', 'libvpx-vp9', 'copy'];
const AUDIO_CODECS = ['libmp3lame', 'aac', 'libvorbis', 'copy'];
const RESOLUTIONS = ['1920:1080', '1280:720', '854:480', '640:360'];
const FPS_OPTIONS = ['24', '30', '60'];
const SAMPLE_RATES = ['22050', '44100', '48000'];
const CHANNELS = ['mono', 'stereo'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export function CompressionConfigPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileId = Number(id);

  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');
  const [form, setForm] = useState({
    format: 'mp4',
    codec: 'libx264',
    bitrate: '2000',
    resolution: '1280:720',
    fps: '30',
    audio_bitrate: '128',
    sample_rate: '44100',
    channel: 'stereo',
    is_recommended: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleTypeChange = (type: 'video' | 'audio') => {
    setMediaType(type);
    setForm(f => ({ ...f, format: type === 'video' ? 'mp4' : 'mp3', codec: type === 'video' ? 'libx264' : 'libmp3lame' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { file_id: fileId, format: form.format };
      if (mediaType === 'video') {
        payload.codec       = form.codec;
        payload.bitrate     = form.bitrate ? Number(form.bitrate) : undefined;
        payload.resolution  = form.resolution || undefined;
        payload.fps         = form.fps ? Number(form.fps) : undefined;
        payload.audio_bitrate = form.audio_bitrate ? Number(form.audio_bitrate) : undefined;
      } else {
        payload.codec         = form.codec;
        payload.audio_bitrate = form.audio_bitrate ? Number(form.audio_bitrate) : undefined;
        payload.sample_rate   = form.sample_rate ? Number(form.sample_rate) : undefined;
        payload.channel       = form.channel;
      }
      payload.is_recommended = form.is_recommended;
      await compressionsApi.create(payload as any);
      navigate(`/files/${fileId}`);
    } catch (err: any) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Failed to start compression.');
    } finally { setSubmitting(false); }
  };

  return (
    <AppLayout>
      <div className="fade-in" style={{ maxWidth: 560 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>Dashboard</button>
          <span>/</span>
          <button onClick={() => navigate(`/files/${fileId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>File Detail</button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>New Compression</span>
        </div>

        <h1 className="page-title">Configure Compression</h1>
        <p className="page-subtitle">Set FFMPEG parameters for your compression</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#fca5a5', marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {(['video', 'audio'] as const).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={mediaType === t ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {t === 'video' ? '🎬 Video' : '🎵 Audio'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {/* Format */}
              <Field label="Output Format">
                <select className="form-select" value={form.format} onChange={set('format')}>
                  {(mediaType === 'video' ? VIDEO_FORMATS : AUDIO_FORMATS).map(f => (
                    <option key={f} value={f}>.{f}</option>
                  ))}
                </select>
              </Field>

              {/* Codec */}
              <Field label="Codec">
                <select className="form-select" value={form.codec} onChange={set('codec')}>
                  {(mediaType === 'video' ? VIDEO_CODECS : AUDIO_CODECS).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              {mediaType === 'video' ? (
                <>
                  <Field label="Video Bitrate (kbps)">
                    <input type="number" className="form-input" value={form.bitrate} onChange={set('bitrate')} placeholder="e.g. 2000" min={100} />
                  </Field>
                  <Field label="Resolution">
                    <select className="form-select" value={form.resolution} onChange={set('resolution')}>
                      <option value="">— Keep original —</option>
                      {RESOLUTIONS.map(r => <option key={r} value={r}>{r.replace(':', '×')}</option>)}
                    </select>
                  </Field>
                  <Field label="FPS">
                    <select className="form-select" value={form.fps} onChange={set('fps')}>
                      <option value="">— Keep original —</option>
                      {FPS_OPTIONS.map(f => <option key={f} value={f}>{f} fps</option>)}
                    </select>
                  </Field>
                  <Field label="Audio Bitrate (kbps)">
                    <input type="number" className="form-input" value={form.audio_bitrate} onChange={set('audio_bitrate')} placeholder="e.g. 128" min={32} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Audio Bitrate (kbps)">
                    <input type="number" className="form-input" value={form.audio_bitrate} onChange={set('audio_bitrate')} placeholder="e.g. 128" min={32} />
                  </Field>
                  <Field label="Sample Rate">
                    <select className="form-select" value={form.sample_rate} onChange={set('sample_rate')}>
                      {SAMPLE_RATES.map(r => <option key={r} value={r}>{r} Hz</option>)}
                    </select>
                  </Field>
                  <Field label="Channel">
                    <select className="form-select" value={form.channel} onChange={set('channel')}>
                      {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </>
              )}
            </div>

            {/* Recommended toggle */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                id="recommended"
                type="checkbox"
                checked={form.is_recommended}
                onChange={e => setForm(f => ({ ...f, is_recommended: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: '#7c3aed' }}
              />
              <label htmlFor="recommended" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                ⭐ Mark as recommended compression
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Starting…</> : '🚀 Start Compression'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(`/files/${fileId}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
