"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#334155',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontWeight: 600,
          border: '1px solid #C2C2C4'
        },
        success: {
          iconTheme: {
            primary: '#4f46e5',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
