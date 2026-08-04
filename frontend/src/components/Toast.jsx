import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const typeStyles = {
    success: 'bg-emerald-500 text-white shadow-emerald-500/20',
    error: 'bg-rose-500 text-white shadow-rose-500/20',
    info: 'bg-amber-500 text-white shadow-amber-500/20',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-white/20 transition-all ${
          typeStyles[toast.type] || typeStyles.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <span className="text-sm font-medium pr-2">{toast.message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
