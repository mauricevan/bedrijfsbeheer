import React from "react";

export interface ConfirmModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

/**
 * Generic ConfirmModal component for confirmation dialogs
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close } = useModal();
 * 
 * <ConfirmModal
 *   show={isOpen}
 *   onClose={close}
 *   title="Verwijderen?"
 *   message="Weet je zeker dat je dit item wilt verwijderen?"
 *   confirmText="Verwijderen"
 *   cancelText="Annuleren"
 *   onConfirm={() => {
 *     handleDelete();
 *     close();
 *   }}
 *   variant="danger"
 * />
 * ```
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  onClose,
  title,
  message,
  confirmText = "Bevestigen",
  cancelText = "Annuleren",
  onConfirm,
  variant = "info",
  isLoading = false,
}) => {
  if (!show) return null;

  const variantStyles = {
    danger: {
      button: "bg-red-500 hover:bg-red-600",
      icon: "⚠️",
    },
    warning: {
      button: "bg-orange-500 hover:bg-orange-600",
      icon: "⚠️",
    },
    info: {
      button: "bg-blue-500 hover:bg-blue-600",
      icon: "ℹ️",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 text-3xl mr-3">{style.icon}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-2"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${style.button}`}
          >
            {isLoading ? "Bezig..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

