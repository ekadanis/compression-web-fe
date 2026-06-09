import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { AppLayout } from '../components/AppLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { DarkSelect } from '../components/DarkSelect';
import { DarkDateTimePicker } from '../components/DarkDateTimePicker';
import { youtubeApi } from '../api/youtube';
import { formatBytes, formatDate } from '../lib/utils';
import type {
  CreateYoutubeUploadPayload,
  YoutubeAccountResponse,
  YoutubeSource,
  YoutubeUpload,
} from '../types';

const STATUS_COLORS: Record<YoutubeUpload['status'], string> = {
  pending: 'badge-uploaded',
  scheduled: 'badge-processing',
  processing: 'badge-processing',
  uploaded: 'badge-done',
  failed: 'badge-failed',
  cancelled: 'badge-failed',
};

const YOUTUBE_CATEGORIES = [
  { id: '1', label: 'Film & Animation' },
  { id: '2', label: 'Autos & Vehicles' },
  { id: '10', label: 'Music' },
  { id: '15', label: 'Pets & Animals' },
  { id: '17', label: 'Sports' },
  { id: '19', label: 'Travel & Events' },
  { id: '20', label: 'Gaming' },
  { id: '22', label: 'People & Blogs' },
  { id: '23', label: 'Comedy' },
  { id: '24', label: 'Entertainment' },
  { id: '25', label: 'News & Politics' },
  { id: '26', label: 'Howto & Style' },
  { id: '27', label: 'Education' },
  { id: '28', label: 'Science & Technology' },
];

const DEFAULT_FORM: CreateYoutubeUploadPayload = {
  source_type: 'file',
  source_id: 0,
  title: '',
  description: '',
  tags: [],
  category_id: '22',
  visibility: 'private',
  schedule_mode: 'now',
};

export function YoutubePage() {
  const [account, setAccount] = useState<YoutubeAccountResponse | null>(null);
  const [sources, setSources] = useState<YoutubeSource[]>([]);
  const [uploads, setUploads] = useState<YoutubeUpload[]>([]);
  const [form, setForm] = useState<CreateYoutubeUploadPayload>(DEFAULT_FORM);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [actionTarget, setActionTarget] = useState<{ upload: YoutubeUpload; action: 'cancel' | 'delete' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const selectedSource = useMemo(
    () => sources.find((item) => item.source_type === form.source_type && item.source_id === form.source_id) ?? null,
    [form.source_id, form.source_type, sources],
  );
  const nowDateTimeLocal = getMinDateTimeLocal();

  const load = async () => {
    setLoading(true);
    try {
      const [accountRes, sourcesRes, uploadsRes] = await Promise.all([
        youtubeApi.account(),
        youtubeApi.sources(),
        youtubeApi.uploads(),
      ]);

      setAccount(accountRes);
      setSources(sourcesRes.sources);
      setUploads(uploadsRes);

      if (!form.source_id && sourcesRes.sources.length > 0) {
        const first = sourcesRes.sources[0];
        setForm((current) => ({
          ...current,
          source_type: first.source_type,
          source_id: first.source_id,
          title: current.title || first.file_name.replace(/\.[^.]+$/, ''),
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load YouTube page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === '1') {
      setMessage('Akun YouTube berhasil terhubung.');
      window.history.replaceState({}, '', '/youtube');
    } else if (params.get('error')) {
      setError(params.get('error') ?? 'OAuth failed.');
      window.history.replaceState({}, '', '/youtube');
    }

    load();
  }, []);

  useEffect(() => {
    const needsPolling = uploads.some((upload) => ['pending', 'scheduled', 'processing'].includes(upload.status));

    if (!needsPolling) {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const fresh = await youtubeApi.uploads();
        setUploads(fresh);
      } catch {
        // ignore transient polling errors
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [uploads]);

  useEffect(() => {
    if (!selectedSource) {
      return;
    }

    setForm((current) => {
      if (current.title.trim() !== '') {
        return current;
      }

      return {
        ...current,
        title: selectedSource.file_name.replace(/\.[^.]+$/, ''),
      };
    });
  }, [selectedSource]);

  const handleConnect = async () => {
    setConnecting(true);
    setError('');

    try {
      const { url } = await youtubeApi.authRedirect();
      window.location.href = url;
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to start Google OAuth.');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError('');
    setMessage('');

    try {
      const res = await youtubeApi.disconnect();
      setMessage(res.message);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to disconnect YouTube account.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSubmit = async () => {
    const nextFieldErrors: Record<string, string> = {};

    if (!form.source_id) {
      nextFieldErrors.source = 'Video source wajib dipilih.';
    }

    if (!form.title.trim()) {
      nextFieldErrors.title = 'Title wajib diisi.';
    }

    if (form.schedule_mode === 'scheduled' && (!form.scheduled_at || new Date(form.scheduled_at).getTime() <= Date.now())) {
      nextFieldErrors.scheduled_at = 'Pilih jadwal upload setelah waktu sekarang.';
    }

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      setError('Lengkapi field yang wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const payload: CreateYoutubeUploadPayload = {
        ...form,
        tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
        scheduled_at: form.schedule_mode === 'scheduled' && form.scheduled_at
          ? new Date(form.scheduled_at).toISOString()
          : undefined,
      };

      const created = await youtubeApi.createUpload(payload);
      setUploads((current) => [created, ...current]);
      setMessage(created.status === 'scheduled' ? 'Upload YouTube berhasil dijadwalkan.' : 'Upload YouTube berhasil dibuat dan masuk queue.');
      setForm((current) => ({
        ...current,
        description: '',
        schedule_mode: 'now',
        scheduled_at: undefined,
      }));
      setTagsInput('');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create upload.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadAction = async () => {
    if (!actionTarget) return;

    setActionLoading(true);
    try {
      await youtubeApi.cancelUpload(actionTarget.upload.id);
      if (actionTarget.action === 'delete') {
        setUploads((current) => current.filter((upload) => upload.id !== actionTarget.upload.id));
      } else {
        const fresh = await youtubeApi.uploads();
        setUploads(fresh);
      }
      setMessage(actionTarget.action === 'delete' ? 'Upload dihapus dari YouTube.' : 'Upload dibatalkan.');
      setActionTarget(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update upload.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 className="page-title">YouTube Uploads</h1>
            <p className="page-subtitle">Connect your YouTube account, pick a finished video source, and upload now or on schedule.</p>
          </div>
        </div>

        {message && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '12px 16px', color: '#86efac', marginBottom: 16 }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', color: '#fca5a5', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(320px,0.9fr)', gap: 20, alignItems: 'start' }}>
            <section className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Google Account</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>OAuth is required before queueing uploads to YouTube.</p>
                </div>
                {account?.connected ? (
                  <span className="badge badge-done">Connected</span>
                ) : (
                  <span className="badge badge-failed">Disconnected</span>
                )}
              </div>

              {account?.connected && account.account ? (
                <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Google Email</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{account.account.google_email ?? '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Channel</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{account.account.channel_title ?? '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Token Expires</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{account.account.expires_at ? formatDate(account.account.expires_at) : '-'}</div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 18 }}>
                  Connect one Google account per user. The app stores OAuth tokens encrypted and uses them from the queue worker.
                </p>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                {!account?.connected ? (
                  <button className="btn-primary" onClick={handleConnect} disabled={connecting}>
                    {connecting ? 'Connecting…' : 'Connect YouTube'}
                  </button>
                ) : (
                  <button className="btn-danger" onClick={handleDisconnect} disabled={disconnecting}>
                    {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                )}
              </div>
            </section>

            <section className="glass-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Create Upload</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Supports original video files and completed compression outputs.</p>

              <div style={{ display: 'grid', gap: 14 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Video Source</span>
                  <DarkSelect
                    value={`${form.source_type}:${form.source_id}`}
                    options={sources.length === 0
                      ? [{ value: 'file:0', label: 'No video sources available' }]
                      : sources.map((source) => ({ value: `${source.source_type}:${source.source_id}`, label: source.label }))}
                    onChange={(value) => {
                      const [sourceType, sourceId] = value.split(':');
                      const matched = sources.find((item) => item.source_type === sourceType && item.source_id === Number(sourceId));
                      setFieldErrors((current) => ({ ...current, source: '' }));
                      setForm((current) => ({
                        ...current,
                        source_type: sourceType as 'file' | 'compression',
                        source_id: Number(sourceId),
                        title: matched ? matched.file_name.replace(/\.[^.]+$/, '') : current.title,
                      }));
                    }}
                  />
                  {fieldErrors.source && <FieldError>{fieldErrors.source}</FieldError>}
                </label>

                {selectedSource && (
                  <div style={{ borderRadius: 12, padding: 14, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{selectedSource.file_name}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span>{selectedSource.source_type.toUpperCase()}</span>
                      <span>{selectedSource.mime_type}</span>
                      <span>{formatBytes(selectedSource.size)}</span>
                      <span>{formatDate(selectedSource.created_at)}</span>
                    </div>
                  </div>
                )}

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Title</span>
                  <input style={inputStyle} value={form.title} onChange={(e) => { setFieldErrors((current) => ({ ...current, title: '' })); setForm((current) => ({ ...current, title: e.target.value })); }} />
                  {fieldErrors.title && <FieldError>{fieldErrors.title}</FieldError>}
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Description</span>
                  <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={form.description ?? ''} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tags</span>
                  <input style={inputStyle} placeholder="tutorial, ffmpeg, compression" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Category ID</span>
                    <DarkSelect value={form.category_id ?? '22'} options={YOUTUBE_CATEGORIES.map((category) => ({ value: category.id, label: category.label }))} onChange={(value) => setForm((current) => ({ ...current, category_id: value }))} />
                  </label>

                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Visibility</span>
                    <DarkSelect value={form.visibility} options={[{ value: 'private', label: 'Private' }, { value: 'unlisted', label: 'Unlisted' }, { value: 'public', label: 'Public' }]} onChange={(value) => setForm((current) => ({ ...current, visibility: value as CreateYoutubeUploadPayload['visibility'] }))} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Mode</span>
                    <DarkSelect value={form.schedule_mode} options={[{ value: 'now', label: 'Upload Now' }, { value: 'scheduled', label: 'Schedule' }]} onChange={(value) => setForm((current) => ({ ...current, schedule_mode: value as CreateYoutubeUploadPayload['schedule_mode'], scheduled_at: value === 'now' ? undefined : current.scheduled_at }))} />
                  </label>

                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Scheduled At</span>
                    <DarkDateTimePicker
                      min={nowDateTimeLocal}
                      value={form.scheduled_at}
                      disabled={form.schedule_mode !== 'scheduled'}
                      onChange={(value) => { setFieldErrors((current) => ({ ...current, scheduled_at: '' })); setForm((current) => ({ ...current, scheduled_at: value })); }}
                    />
                    {fieldErrors.scheduled_at && <FieldError>{fieldErrors.scheduled_at}</FieldError>}
                  </label>
                </div>

                <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !account?.connected || sources.length === 0}>
                  {submitting ? 'Submitting…' : form.schedule_mode === 'scheduled' ? 'Schedule Upload' : 'Queue Upload'}
                </button>
              </div>
            </section>
          </div>
        )}

        <section style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Upload History</h2>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Polling every 5s while uploads are active</span>
          </div>

          {uploads.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No YouTube uploads yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {uploads.map((upload) => (
                <article key={upload.id} className="glass-card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                        <h3 style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{upload.title}</h3>
                        <span className={`badge ${STATUS_COLORS[upload.status]}`}>{upload.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        <span>{upload.visibility}</span>
                        <span>{upload.category_id ?? '22'}</span>
                        <span>{formatDate(upload.created_at)}</span>
                        {upload.scheduled_at && <span>scheduled {formatDate(upload.scheduled_at)}</span>}
                      </div>
                      {upload.description && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>{upload.description}</p>}
                      {upload.error_message && <p style={{ margin: '8px 0 0', color: '#fca5a5', fontSize: 13 }}>{upload.error_message}</p>}
                    </div>

                    <div style={{ display: 'grid', gap: 10, justifyItems: 'end', minWidth: 240 }}>
                      {['pending', 'scheduled', 'processing'].includes(upload.status) && (
                        <>
                          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>{upload.progress}%</div>
                          <div className="progress-bar" style={{ width: '100%' }}>
                            <div className="progress-bar-fill" style={{ width: `${upload.progress}%` }} />
                          </div>
                        </>
                      )}
                      {upload.status === 'pending' && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Waiting for queue worker</div>
                      )}
                      {upload.status === 'scheduled' && upload.scheduled_at && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Will start at {formatDate(upload.scheduled_at)}</div>
                      )}
                      {upload.status === 'processing' && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Uploading to YouTube</div>
                      )}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        {upload.url && (
                          <a className="btn-secondary" style={smallActionButtonStyle} href={upload.url} target="_blank" rel="noreferrer">Open Video</a>
                        )}
                        {['pending', 'scheduled', 'processing'].includes(upload.status) && (
                          <button className="btn-danger" style={smallActionButtonStyle} onClick={() => setActionTarget({ upload, action: 'cancel' })}>Cancel</button>
                        )}
                        {['uploaded', 'cancelled', 'failed'].includes(upload.status) && (
                          <button className="btn-danger" style={smallActionButtonStyle} onClick={() => setActionTarget({ upload, action: 'delete' })}>Delete</button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <ConfirmModal
        open={actionTarget !== null}
        title={actionTarget?.action === 'delete' ? 'Delete upload?' : 'Cancel upload?'}
        message={actionTarget?.action === 'delete'
          ? 'If this upload already exists on YouTube, the video will be deleted and the history status becomes cancelled.'
          : 'This upload will be cancelled. Running uploads stop on the next upload chunk.'}
        confirmLabel={actionTarget?.action === 'delete' ? 'Delete' : 'Cancel Upload'}
        loading={actionLoading}
        onConfirm={handleUploadAction}
        onCancel={() => setActionTarget(null)}
      />
    </AppLayout>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <span style={{ color: '#fca5a5', fontSize: 12, fontWeight: 600 }}>{children}</span>;
}

const inputStyle: CSSProperties = {
  border: '1px solid var(--border)',
  background: '#151522',
  color: 'var(--text-primary)',
  borderRadius: 12,
  padding: '12px 14px 12px 18px',
  outline: 'none',
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

const smallActionButtonStyle: CSSProperties = {
  padding: '6px 10px',
  fontSize: 12,
  borderRadius: 8,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};

function getMinDateTimeLocal(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
