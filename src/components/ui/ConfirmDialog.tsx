'use client';

import { useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'primary';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
}

const variantConfig: Record<Variant, {
  iconBg: string;
  iconColor: string;
  Icon: React.ElementType;
  btnClass: string;
}> = {
  danger: {
    iconBg:    'bg-rose-100',
    iconColor: 'text-rose-600',
    Icon:      Trash2,
    btnClass:  'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
  },
  warning: {
    iconBg:    'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon:      AlertTriangle,
    btnClass:  'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
  },
  primary: {
    iconBg:    'bg-blue-100',
    iconColor: 'text-blue-600',
    Icon:      CheckCircle,
    btnClass:  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText  = 'إلغاء',
  variant     = 'danger',
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { iconBg, iconColor, Icon, btnClass } = variantConfig[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar - close button */}
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 pt-2 text-center">
          {/* Icon circle */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${iconBg} mb-4`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>

          <h2 className="text-xl font-black text-slate-800 mb-2">{title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700
                       font-semibold hover:bg-slate-50 transition text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold transition text-sm
                        focus:outline-none focus:ring-2 focus:ring-offset-2 ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
