interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="glass-card"
        style={{ width: '100%', maxWidth: 420, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: '10px 0 22px', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
