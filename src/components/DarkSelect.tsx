import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface DarkSelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface DarkSelectProps<T extends string> {
  value: T;
  options: Array<DarkSelectOption<T>>;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DarkSelect<T extends string>({ value, options, onChange, placeholder = 'Select', disabled = false }: DarkSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((current) => !current)}
        style={{ ...triggerStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.label ?? placeholder}
        </span>
        <span style={{ color: '#7C4DFF', fontSize: 14, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}>⌄</span>
      </button>
      {open && !disabled && (
        <div style={panelStyle}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                style={{ ...itemStyle, background: isSelected ? 'rgba(124,77,255,0.18)' : 'transparent', color: isSelected ? '#fff' : '#EAEAF5' }}
                onMouseEnter={(event) => { if (!isSelected) event.currentTarget.style.background = 'rgba(124,77,255,0.12)'; }}
                onMouseLeave={(event) => { if (!isSelected) event.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ ...accentStyle, opacity: isSelected ? 1 : 0 }} />
                <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 700 }}>{option.label}</span>
                  {option.description && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{option.description}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const triggerStyle: CSSProperties = {
  width: '100%',
  minHeight: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  padding: '0 12px',
  background: '#0F1220',
  color: '#EAEAF5',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
  transition: 'background 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
};

const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: 0,
  zIndex: 50,
  width: '100%',
  padding: 6,
  maxHeight: 180,
  overflowY: 'auto',
  background: '#151A2E',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

const itemStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: 40,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '0 12px',
  border: 'none',
  borderRadius: 9,
  cursor: 'pointer',
  transition: 'background 150ms ease, color 150ms ease',
};

const accentStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 8,
  bottom: 8,
  width: 3,
  borderRadius: 999,
  background: '#7C4DFF',
};
