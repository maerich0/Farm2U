/* =========================================
   Function: formatCurrency
   Description: Formats a number into Peso currency string
   ========================================= */
function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toFixed(2);
}

/* =========================================
   Function: showNotification
   Description: Displays a toast notification on the screen
   ========================================= */
function showNotification(message) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: 'rgb(87, 213, 87)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '8px',
        zIndex: '4000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontWeight: '500',
        animation: 'slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards'
    });
    
    document.body.appendChild(notification);
    
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
}