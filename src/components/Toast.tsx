import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-[#0a1e1b]/80 border-emerald-500/40 text-emerald-300 shadow-emerald-500/5'
                : toast.type === 'error'
                ? 'bg-[#220a0d]/80 border-rose-500/40 text-rose-300 shadow-rose-500/5'
                : 'bg-[#0d162a]/80 border-sky-500/40 text-sky-300 shadow-sky-500/5'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            
            <div className="flex-1 text-sm font-medium pr-1">
              {toast.text}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 hover:opacity-100 opacity-60 text-current transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
