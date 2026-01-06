/* =========================================
   Event: DOMContentLoaded
   Description: Initialize cart table rendering
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof CartManager === 'undefined') {
        console.error('CartManager not found. Check if assets/JS/cart.js is loaded.');
        return;
    }
    loadCartTable();
});

/* =========================================
   Function: loadCartTable
   Description: Populates the cart table with items and calculates totals
   ========================================= */
function loadCartTable() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userRole = user ? user.role : 'consumer';
    
    const cart = CartManager.getCart();
    
    const container = document.getElementById('cartItems');
    const status = document.getElementById('cartStatus');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Empty Cart
    if (!cart || cart.length === 0) {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="ri-shopping-cart-line" style="font-size: 64px; color: #ccc;"></i>
                    <h3 style="margin-top: 20px; color: #666;">Your cart is empty</h3>
                    <a href="shop.html" class="btn" style="margin-top: 20px; display: inline-block; background: var(--main-color); color: white; padding: 10px 20px; border-radius: 30px; text-decoration: none;">Start Shopping</a>
                </div>
            `;
        }
        if (status) status.textContent = "Your cart is empty";
        if (checkoutBtn) checkoutBtn.disabled = true;
        updateSummaryHTML({ subtotal: 0, shipping: 0, tax: 0, total: 0, savings: 0 });
        return;
    }

    // Populated Cart
    if (status) status.textContent = `${cart.length} item(s) in cart`;
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    const totals = CartManager.calculateTotals(cart, userRole);

    if (container) {
        container.innerHTML = '';
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            
            let displayPrice = item.price;
            if (typeof item.price === 'number') {
                displayPrice = '₱' + item.price.toFixed(2);
            }

            let badges = '';
            if (item.quantity >= 10) badges += `<span style="background:#dcfce7; color:#166534; font-size:10px; padding:2px 6px; border-radius:4px; margin-left:5px;">Bulk -10%</span>`;

            div.innerHTML = `
                <div style="display: flex; align-items: center; width: 100%;">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div class="item-info" style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0;">${item.name} ${badges}</h4>
                        <p style="margin: 0; color: var(--main-color); font-weight: 600;">${displayPrice}</p>
                        <div class="item-quantity" style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
                            <button onclick="updateCartItem(${index}, -1)" style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartItem(${index}, 1)" style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                        </div>
                    </div>
                    <button onclick="removeCartItem(${index})" style="background: #fee2e2; color: #ef4444; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    updateSummaryHTML(totals);
}

/* =========================================
   Function: updateSummaryHTML
   Description: Updates the values in the order summary box
   ========================================= */
function updateSummaryHTML(totals) {
    const format = (num) => '₱' + num.toFixed(2);
    
    const subEl = document.getElementById('subtotal');
    const shipEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totEl = document.getElementById('total');

    if (subEl) subEl.textContent = format(totals.subtotal);
    if (shipEl) shipEl.textContent = format(totals.shipping);
    if (taxEl) taxEl.textContent = format(totals.tax);
    if (totEl) totEl.textContent = format(totals.total);
}

/* =========================================
   Function: window.updateCartItem
   Description: Global handler for +/- quantity buttons
   ========================================= */
window.updateCartItem = function(index, change) {
    CartManager.updateQuantity(index, change);
    loadCartTable(); 
};

/* =========================================
   Function: window.removeCartItem
   Description: Global handler for remove button
   ========================================= */
window.removeCartItem = function(index) {
    CartManager.removeItem(index);
    loadCartTable();
};

/* =========================================
   Event: Checkout Button Click
   Description: Processes order and saves to history
   ========================================= */
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert("Please login to checkout");
            window.location.href = 'auth.html';
            return;
        }

        const cart = CartManager.getCart();
        if (cart.length === 0) return;

        const totals = CartManager.calculateTotals(cart, user.role);

        const newOrder = {
            id: Date.now().toString().slice(-6),
            userEmail: user.email,
            date: new Date().toISOString(),
            items: cart,
            total: totals.total,
            status: 'Processing'
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        existingOrders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        localStorage.removeItem('cart');
        alert(`Order #${newOrder.id} placed successfully! Check your dashboard for details.`);
        window.location.href = 'index.html';
    });
}