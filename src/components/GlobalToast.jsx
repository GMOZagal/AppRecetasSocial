import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { eventBus } from '../utils/eventBus';

export const EVENTS = {
  SHOW_TOAST: 'SHOW_TOAST'
};

/**
 * GlobalToast Provider component.
 * Uses the Observer Pattern (via EventBus) to listen for toast notifications
 * from ANYWHERE in the application without needing props passed down.
 */
export default function GlobalToast() {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  useEffect(() => {
    // 1. Subscribe to the completely decoupled EventBus
    const handleShowToast = (data) => {
      setToast({
        message: data.message,
        type: data.type || 'success',
        visible: true
      });
    };

    const unsubscribe = eventBus.subscribe(EVENTS.SHOW_TOAST, handleShowToast);

    // 2. Unsubscribe on unmount to prevent memory leaks
    return () => {
      unsubscribe();
    };
  }, []);

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-0 right-0 z-[100] p-4 sm:p-6 w-full sm:w-auto pointer-events-none">
      <div className="pointer-events-auto">
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      </div>
    </div>
  );
}
