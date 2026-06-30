import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 ' +
    'disabled:opacity-50 disabled:pointer-events-none px-4 py-2 text-sm';
  const variants = {
    primary: 'bg-brand-blue hover:bg-brand-blue/85 text-white',
    ghost: 'bg-navy-700 hover:bg-navy-600 text-slate-100',
    danger: 'bg-red-600/90 hover:bg-red-600 text-white',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={
        'w-full rounded-lg bg-navy-900 border border-navy-600 px-3 py-2 text-sm ' +
        'text-slate-100 placeholder:text-slate-500 focus:outline-none ' +
        'focus:ring-2 focus:ring-brand-light focus:border-transparent ' +
        className
      }
      {...props}
    />
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-navy-800 border border-navy-700 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-navy-600 border-t-brand-light"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
