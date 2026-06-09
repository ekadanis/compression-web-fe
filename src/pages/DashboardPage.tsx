import { useState, useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { FileCard } from '../components/FileCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { filesApi } from '../api/files';
import type { File, PaginatedResponse } from '../types';
import { formatBytes } from '../lib/utils';

type FileTypeFilter = 'all' | 'audio' | 'video';
type FileSort = 'updated_desc' | 'updated_asc' | 'name_asc' | 'name_desc';

const TYPE_OPTIONS: Array<{ value: FileTypeFilter; label: string; description: string }> = [
  { value: 'all', label: 'All types', description: 'Audio and video' },
  { value: 'audio', label: 'Audio', description: 'Sound files only' },
  { value: 'video', label: 'Video', description: 'Video files only' },
];

const SORT_OPTIONS: Array<{ value: FileSort; label: string; description: string }> = [
  { value: 'updated_desc', label: 'Last modified newest', description: 'Newest changes first' },
  { value: 'updated_asc', label: 'Last modified oldest', description: 'Oldest changes first' },
  { value: 'name_asc', label: 'Name A-Z', description: 'Alphabetical order' },
  { value: 'name_desc', label: 'Name Z-A', description: 'Reverse alphabetical' },
];

export function DashboardPage() {
  const [data, setData] = useState<PaginatedResponse<File> | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>('all');
  const [sort, setSort] = useState<FileSort>('updated_desc');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'type' | 'sort' | null>(null);
  const navigate = useNavigate();

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await filesApi.list({ page, type: typeFilter, sort, search: search.trim() || undefined });
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [typeFilter, sort, search]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await filesApi.delete(deleteId);
      setDeleteId(null);
      load(data?.current_page ?? 1);
    } finally {
      setDeleting(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Files
            </h2>
            <div style={filterBarStyle}>
              <div style={{ ...filterControlStyle, minWidth: 240 }}>
                <span style={filterIconStyle}>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search media..."
                  style={filterTextInputStyle}
                />
              </div>
              <FilterDropdown
                label="Type"
                width={170}
                open={openDropdown === 'type'}
                value={typeFilter}
                options={TYPE_OPTIONS}
                onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                onChange={(value) => { setTypeFilter(value); setOpenDropdown(null); }}
              />
              <FilterDropdown
                label="Sort"
                width={260}
                open={openDropdown === 'sort'}
                value={sort}
                options={SORT_OPTIONS}
                onToggle={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                onChange={(value) => { setSort(value); setOpenDropdown(null); }}
              />
            </div>
          </div>
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
                  onDelete={() => setDeleteId(file.id)}
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
      <ConfirmModal
        open={deleteId !== null}
        title="Delete file?"
        message="This file and all compressions will be deleted. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AppLayout>
  );
}

interface FilterDropdownProps<T extends string> {
  label: string;
  width: number;
  open: boolean;
  value: T;
  options: Array<{ value: T; label: string; description: string }>;
  onToggle: () => void;
  onChange: (value: T) => void;
}

function FilterDropdown<T extends string>({ label, width, open, value, options, onToggle, onChange }: FilterDropdownProps<T>) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div style={{ position: 'relative', width }}>
      <button type="button" onClick={onToggle} style={{ ...filterControlStyle, width: '100%', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={filterLabelStyle}>{label}</span>
          <span style={triggerValueStyle}>{selected.label}</span>
        </span>
        <span style={{ color: '#7C4DFF', fontSize: 14, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}>⌄</span>
      </button>
      {open && (
        <div style={{ ...dropdownPanelStyle, width }}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                style={{
                  ...dropdownItemStyle,
                  background: isSelected ? 'rgba(124,77,255,0.18)' : 'transparent',
                  color: isSelected ? '#fff' : '#EAEAF5',
                }}
                onMouseEnter={(event) => {
                  if (!isSelected) event.currentTarget.style.background = 'rgba(124,77,255,0.12)';
                }}
                onMouseLeave={(event) => {
                  if (!isSelected) event.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ ...selectedAccentStyle, opacity: isSelected ? 1 : 0 }} />
                <span style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{option.label}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const filterBarStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  alignItems: 'center',
};

const filterControlStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 40,
  padding: '0 12px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0F1220',
  backdropFilter: 'blur(12px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.18)',
  color: '#EAEAF5',
  cursor: 'pointer',
  transition: 'border-color 150ms ease, background 150ms ease, box-shadow 150ms ease',
};

const filterIconStyle: CSSProperties = {
  color: 'var(--accent-light)',
  fontSize: 16,
  lineHeight: 1,
};

const filterLabelStyle: CSSProperties = {
  color: 'var(--text-secondary)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const filterTextInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
};

const triggerValueStyle: CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: '#EAEAF5',
  fontSize: 13,
  fontWeight: 700,
};

const dropdownPanelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  zIndex: 20,
  padding: 6,
  background: '#151A2E',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  color: '#EAEAF5',
};

const dropdownItemStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  minHeight: 40,
  padding: '0 12px',
  border: 'none',
  borderRadius: 9,
  cursor: 'pointer',
  transition: 'background 150ms ease, color 150ms ease',
};

const selectedAccentStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 8,
  bottom: 8,
  width: 3,
  borderRadius: 999,
  background: '#7C4DFF',
};
