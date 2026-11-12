import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Overlay';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', loading, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" hideTitle title={title}>
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <span className={tone === 'danger' ? 'flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600 dark:bg-danger-500/15' : 'flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15'}>
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-fg">{title}</h2>
          <div className="mt-1.5 text-sm text-fg-muted">{message}</div>
        </div>
        <div className="mt-2 grid w-full grid-cols-2 gap-3">
          <Button variant="outline" onClick={onCancel} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
