import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  value?: string;
  min?: string;
  disabled?: boolean;
  onChange: (value: string | undefined) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DarkDateTimePicker({ value, min, disabled = false, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const minDate = min ? fromLocalValue(min) : new Date();
  const parsedValue = value ? fromLocalValue(value) : null;
  const selectedDate = parsedValue && isValidDate(parsedValue) ? parsedValue : null;
  const [open, setOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [viewDate, setViewDate] = useState(selectedDate ?? minDate);
  const [time, setTime] = useState(selectedDate ? toTimeValue(selectedDate) : toTimeValue(minDate));

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target) || popupRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    const nextDate = value ? fromLocalValue(value) : null;
    if (nextDate && isValidDate(nextDate)) setTime(toTimeValue(nextDate));
  }, [value]);

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const display = selectedDate ? formatDisplay(selectedDate) : 'Select date and time';

  const toggleOpen = () => {
    if (disabled) return;

    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setPopupPosition({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
    }

    setOpen((current) => !current);
  };

  const pickDate = (date: Date) => {
    if (isBeforeMinute(date, minDate)) return;

    const next = `${toDateValue(date)}T${time}`;
    if (isBeforeMinute(fromLocalValue(next), minDate)) {
      const fallback = `${toDateValue(minDate)}T${toTimeValue(minDate)}`;
      setTime(toTimeValue(minDate));
      onChange(fallback);
      return;
    }

    onChange(next);
  };

  const changeTime = (nextTime: string) => {
    setTime(nextTime);
    const datePart = value?.slice(0, 10) ?? toDateValue(minDate);
    const next = `${datePart}T${nextTime}`;
    onChange(isBeforeMinute(fromLocalValue(next), minDate) ? `${toDateValue(minDate)}T${toTimeValue(minDate)}` : next);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        style={{ ...triggerStyle, ...(disabled ? disabledStyle : {}) }}
      >
        <span>{display}</span>
        <span style={{ color: '#7C4DFF' }}>▦</span>
      </button>
      {open && !disabled && createPortal(
        <div ref={popupRef} style={{ ...popupStyle, top: popupPosition.top, left: popupPosition.left }}>
          <div style={headerStyle}>
            <button type="button" style={navButtonStyle} onClick={() => setViewDate(addMonths(viewDate, -1))}>‹</button>
            <div style={{ color: '#fff', fontWeight: 800 }}>{viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
            <button type="button" style={navButtonStyle} onClick={() => setViewDate(addMonths(viewDate, 1))}>›</button>
          </div>

          <div style={weekdayGridStyle}>
            {WEEKDAYS.map((day) => <div key={day} style={weekdayStyle}>{day}</div>)}
          </div>

          <div style={dayGridStyle}>
            {days.map((date, index) => {
              const inactive = date.getMonth() !== viewDate.getMonth();
              const disabledDay = isBeforeDay(date, minDate);
              const active = selectedDate && sameDay(date, selectedDate);

              return (
                <button
                  key={`${date.toISOString()}-${index}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => pickDate(date)}
                  style={{
                    ...dayStyle,
                    color: inactive ? 'rgba(255,255,255,0.28)' : '#EAEAF5',
                    background: active ? 'rgba(124,77,255,0.22)' : 'transparent',
                    borderColor: active ? '#7C4DFF' : 'transparent',
                    cursor: disabledDay ? 'not-allowed' : 'pointer',
                    opacity: disabledDay ? 0.35 : 1,
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div style={timeRowStyle}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700 }}>Time</span>
            <input type="time" value={time} onChange={(event) => changeTime(event.target.value)} style={timeInputStyle} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function buildCalendarDays(date: Date): Date[] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function fromLocalValue(value: string): Date { return new Date(value); }
function isValidDate(date: Date): boolean { return !Number.isNaN(date.getTime()); }
function toDateValue(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function toTimeValue(date: Date): string { return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; }
function addMonths(date: Date, amount: number): Date { return new Date(date.getFullYear(), date.getMonth() + amount, 1); }
function sameDay(a: Date, b: Date): boolean { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isBeforeDay(a: Date, b: Date): boolean { return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() < new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime(); }
function isBeforeMinute(a: Date, b: Date): boolean { return a.getTime() < b.getTime(); }
function formatDisplay(date: Date): string { return `${date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} ${toTimeValue(date)}`; }

const triggerStyle: CSSProperties = {
  width: '100%', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  padding: '0 16px', background: '#0F1220', color: '#EAEAF5', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const disabledStyle: CSSProperties = { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', cursor: 'not-allowed', boxShadow: 'none' };
const popupStyle: CSSProperties = { position: 'absolute', zIndex: 10000, width: 336, padding: 20, background: '#151A2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' };
const headerStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 4px' };
const navButtonStyle: CSSProperties = { width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#0F1220', color: '#EAEAF5', cursor: 'pointer' };
const weekdayGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 8, padding: '0 4px' };
const weekdayStyle: CSSProperties = { height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 800 };
const dayGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, padding: '0 4px 16px' };
const dayStyle: CSSProperties = { height: 32, borderRadius: 8, border: '1px solid transparent', background: 'transparent', fontSize: 12, fontWeight: 700, transition: 'background 150ms ease, border-color 150ms ease' };
const timeRowStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 4px 0' };
const timeInputStyle: CSSProperties = { width: 128, background: '#0F1220', color: '#EAEAF5', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', outline: 'none' };
