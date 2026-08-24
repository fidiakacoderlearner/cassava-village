export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  confirmDisabled = false,
  confirmLoading = false,
  warningMessage = null,
  children = null,
}) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    primary: 'bg-brown-800 hover:bg-brown-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="font-display text-lg font-bold text-brown-800">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-brown-600">{message}</p>
        {warningMessage && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            {warningMessage}
          </p>
        )}
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-brown-100 px-5 py-2.5 text-sm font-semibold text-brown-700 transition-colors hover:bg-brown-200"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled || confirmLoading}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow transition-colors ${variantClasses[variant]} disabled:opacity-50`}
          >
            {confirmLoading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}