import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

/**
 * Alert — Per 14_ACD: Reusable alert component.
 * Per LOCK-10: Monochrome with semantic colors.
 */
type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const alertConfig: Record<AlertVariant, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'text-blue-500' },
  success: { icon: CheckCircle2, className: 'text-green-500' },
  warning: { icon: AlertCircle, className: 'text-yellow-500' },
  error: { icon: XCircle, className: 'text-destructive' },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border p-4',
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.className)} />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-sm text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}
