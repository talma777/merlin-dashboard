import * as React from 'react';
import { cn } from '@/lib/utils';

// ── Badge ─────────────────────────────────────────────────────────────────
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
}
export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default:  'bg-slate-700 text-slate-200',
    outline:  'border border-current bg-transparent',
    success:  'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30',
    warning:  'bg-amber-400/15 text-amber-400 border border-amber-400/30',
    danger:   'bg-red-400/15 text-red-400 border border-red-400/30',
    info:     'bg-blue-400/15 text-blue-400 border border-blue-400/30',
  };
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  );
}

// ── Button ────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary:   'bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-900/30',
      secondary: 'bg-slate-700/60 text-slate-200 hover:bg-slate-700 border border-slate-600/40',
      ghost:     'text-slate-300 hover:bg-slate-700/50 hover:text-white',
      danger:    'bg-red-600/90 text-white hover:bg-red-500',
      outline:   'border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white',
    };
    const sizes = {
      sm:   'h-7 px-3 text-xs gap-1.5',
      md:   'h-9 px-4 text-sm gap-2',
      lg:   'h-10 px-5 text-sm gap-2',
      icon: 'h-8 w-8',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant], sizes[size], className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm', className)}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4 border-b border-slate-700/50', className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold text-slate-200 tracking-tight', className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-3 border-t border-slate-700/50', className)} {...props} />;
}

// ── Input ─────────────────────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-slate-600/50 bg-slate-800/60 px-3 py-1.5',
        'text-sm text-slate-200 placeholder:text-slate-500',
        'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-150',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────────────────────────────────
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-slate-600/50 bg-slate-800/60 px-3 py-2',
        'text-sm text-slate-200 placeholder:text-slate-500 resize-none',
        'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

// ── Select ────────────────────────────────────────────────────────────────
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-slate-600/50 bg-slate-800/60 px-3 py-1.5',
        'text-sm text-slate-200',
        'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = 'Select';

// ── Label ─────────────────────────────────────────────────────────────────
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-xs font-medium text-slate-400 mb-1', className)}
      {...props}
    />
  );
}

// ── Separator ─────────────────────────────────────────────────────────────
export function Separator({ className }: { className?: string }) {
  return <hr className={cn('border-slate-700/60', className)} />;
}

// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 'sm', className }: { size?: 'xs' | 'sm' | 'md'; className?: string }) {
  const s = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-6 w-6' };
  return (
    <svg className={cn('animate-spin text-blue-500', s[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, className, color = 'blue' }: { value: number; max?: number; className?: string; color?: 'blue' | 'emerald' | 'amber' | 'red' }) {
  const pct = Math.round((value / max) * 100);
  const colors = {
    blue:    'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    red:     'bg-red-500',
  };
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-slate-700/60', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────
export function Alert({ variant = 'info', children, className }: {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info:    'bg-blue-400/10 border-blue-400/30 text-blue-300',
    success: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300',
    warning: 'bg-amber-400/10 border-amber-400/30 text-amber-300',
    danger:  'bg-red-400/10 border-red-400/30 text-red-300',
  };
  return (
    <div className={cn('rounded-lg border p-3 text-sm', styles[variant], className)}>
      {children}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-slate-600 text-4xl">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, color = 'blue' }: {
  label: string; value: string | number; sub?: string;
  icon?: React.ReactNode; color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}) {
  const colors = {
    blue:   'border-blue-500/20 bg-blue-500/5',
    emerald:'border-emerald-500/20 bg-emerald-500/5',
    amber:  'border-amber-500/20 bg-amber-500/5',
    red:    'border-red-500/20 bg-red-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
  };
  return (
    <div className={cn('rounded-xl border p-4', colors[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-slate-100">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="text-slate-500">{icon}</div>
        )}
      </div>
    </div>
  );
}
