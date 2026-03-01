"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-3 whitespace-pre-line text-sm text-base-content/80">
          {message}
        </p>
        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn btn-sm ${danger ? "btn-error" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </div>
  );
}
