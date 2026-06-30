'use client';
import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function Select({
  name,
  options,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Tanlang...',
  required,
  className = '',
}: SelectProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const selected = options.find(o => o.value === current);

  function pick(val: string) {
    if (!isControlled) setInternal(val);
    onChange?.(val);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm text-left bg-white transition-colors ${
          open ? 'border-[#F5B800] ring-1 ring-[#F5B800]/30' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={`truncate ${selected ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[300] top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto py-1">
            {!required && (
              <button
                type="button"
                onClick={() => pick('')}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  current === '' ? 'bg-amber-50 text-[#D4970A] font-medium' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {placeholder}
              </button>
            )}
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  current === opt.value
                    ? 'bg-amber-50 text-[#D4970A] font-medium'
                    : 'text-[#1A1A1A] hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
