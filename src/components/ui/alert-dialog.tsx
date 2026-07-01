"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
}: AlertDialogProps) {
  // Prevent background scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md bg-white rounded-4xl border border-slate-100/85 p-6 shadow-2xl flex flex-col gap-5 pointer-events-auto z-10 overflow-hidden"
          >
            {/* Header Content */}
            <div className="flex gap-4 items-start">
              {isDestructive && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div className="flex flex-col gap-1 text-left">
                <h3 className="font-extrabold text-slate-800 text-base tracking-tight leading-snug">{title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                  {description}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100/80">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
                  isDestructive
                    ? "bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-rose-100 hover:shadow-lg"
                    : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-100 hover:shadow-lg"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
