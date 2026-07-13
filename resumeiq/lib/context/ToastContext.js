"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

/**
 * Toast provider — wraps the app and provides showToast().
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to access showToast from any component.
 * Usage: const { showToast } = useToast();
 *        showToast("Saved!", "success");
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/** Internal toast stack renderer */
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-600 text-white",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            animate-[slideIn_0.25s_ease-out] ${typeStyles[toast.type] ?? typeStyles.info}`}
          style={{ animation: "slideInRight 0.25s ease-out" }}
        >
          <span className="text-base leading-none mt-0.5 flex-shrink-0">
            {icons[toast.type] ?? icons.info}
          </span>
          <p className="flex-1 leading-snug">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0 text-base leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
