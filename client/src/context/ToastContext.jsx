import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-success flex-shrink-0" />;
      case 'error':
        return <XCircle size={18} className="text-danger flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-warning flex-shrink-0" />;
      default:
        return <Info size={18} className="text-primary flex-shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'var(--pc-success)';
      case 'error':
        return 'var(--pc-danger)';
      case 'warning':
        return 'var(--pc-warning)';
      default:
        return 'var(--pc-primary)';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, success: (m) => addToast(m, 'success'), error: (m) => addToast(m, 'error'), warning: (m) => addToast(m, 'warning'), info: (m) => addToast(m, 'info') }}>
      {children}
      <div className="toast-container-custom">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-custom"
            style={{ borderLeftColor: getBorderColor(toast.type) }}
          >
            <div className="d-flex align-items-center gap-2">
              {getIcon(toast.type)}
              <span className="small text-dark font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-sm btn-link text-muted p-0 ms-2"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
