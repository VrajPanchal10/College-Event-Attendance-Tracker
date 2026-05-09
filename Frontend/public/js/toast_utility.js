/**
 * PREMIUM TOAST NOTIFICATION SYSTEM
 * 
 * Features:
 * - Top-center positioning (Responsive-friendly)
 * - Modern Glassmorphism & Shadow
 * - Success/Error/Info Icon support
 * - Smooth slide-in/out animations
 * - Queue handling (multiple toasts at once)
 */

function showToast(message, type = 'success') {
    // 1. Ensure Container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        // Force top-level positioning to avoid stacking context issues
        container.style.cssText = `
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            pointer-events: none;
            width: 100%;
            max-width: 400px;
            padding: 0 20px;
        `;
        document.body.appendChild(container);
    }

    // 2. Create Toast Element
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    // Style icons based on type
    let icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'info') icon = 'ℹ';

    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon" aria-hidden="true">${icon}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    // 3. Modern CSS for the Toast Item (Injected if not in CSS file)
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            .toast-item {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(226, 232, 240, 0.8);
                color: #1e293b;
                padding: 12px 20px;
                border-radius: 14px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                min-width: 280px;
                max-width: 100%;
                pointer-events: auto;
                animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                transition: all 0.3s ease;
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
            }
            .toast-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                font-size: 14px;
                font-weight: bold;
                flex-shrink: 0;
            }
            .toast-success .toast-icon { background: #10b981; color: white; }
            .toast-error .toast-icon { background: #ef4444; color: white; }
            .toast-info .toast-icon { background: #3b82f6; color: white; }
            
            .toast-message {
                font-family: 'Poppins', sans-serif;
                font-size: 0.9rem;
                font-weight: 500;
                color: #334155;
            }

            @keyframes toastIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.9); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes toastOut {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to { opacity: 0; transform: translateY(-10px) scale(0.95); }
            }
            .toast-item.exit {
                animation: toastOut 0.3s ease forwards;
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    // 4. Auto-dismiss
    setTimeout(() => {
        toast.classList.add('exit');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Global expose
window.showToast = showToast;
