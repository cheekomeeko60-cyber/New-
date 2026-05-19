import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-[#6B6B6B] hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-2xl mb-6 ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-black'}`}>
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2 tracking-tight">{title}</h3>
              <p className="text-[#6B6B6B] mb-8 leading-relaxed">{message}</p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    variant === 'danger' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-transparent text-[#6B6B6B] font-bold hover:text-black transition-colors"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
