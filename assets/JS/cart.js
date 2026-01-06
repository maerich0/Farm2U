/* =========================================
   Object: CartManager
   Description: Manages cart state and calculations
   ========================================= */
const CartManager = {
    
    /* -------------------------------------
       Function: getCart
       Description: Retrieves cart array from localStorage
       ------------------------------------- */
    getCart() { 
        return JSON.parse(localStorage.getItem('cart')) || []; 
    },

    /* -------------------------------------
       Function: saveCart
       Description: Saves cart array to localStorage and updates UI count
       ------------------------------------- */
    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
    },

    /* -------------------------------------
       Function: addItem
       Description: Adds an item to the cart or increments quantity
       ------------------------------------- */
    addItem(product) {
        let cart = this.getCart();
        const existingIndex = cart.findIndex(item => item.name === product.name);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        this.saveCart(cart);
        if (typeof showNotification === 'function') {
            showNotification(`${product.name} added to cart!`);
        } else {
            alert(`${product.name} added to cart!`);
        }
    },

    /* -------------------------------------
       Function: updateQuantity
       Description: Increments or decrements item quantity
       ------------------------------------- */
    updateQuantity(index, change) {
        let cart = this.getCart();
        if (cart[index]) {
            const newQty = (cart[index].quantity || 1) + change;
            if (newQty < 1) {
                cart.splice(index, 1);
            } else {
                cart[index].quantity = newQty;
            }
            this.saveCart(cart);
            return true;
        }
        return false;
    },

    /* -------------------------------------
       Function: removeItem
       Description: Completely removes an item from cart
       ------------------------------------- */
    removeItem(index) {
        let cart = this.getCart();
        cart.splice(index, 1);
        this.saveCart(cart);
    },

    /* -------------------------------------
       Function: calculateTotals
       Description: Calculates subtotal, tax, shipping, and applies discounts
       ------------------------------------- */
    calculateTotals(cart, userRole = 'consumer') {
        let subtotal = 0;
        let savings = 0;

        cart.forEach(item => {
            let priceString = item.price ? item.price.toString() : "0";
            let price = parseFloat(priceString.replace(/[^0-9.]/g, ''));
            if (isNaN(price)) price = 0;

            let lineTotal = price * (item.quantity || 1);
            
            // Bulk Discount
            if (item.quantity >= 10) {
                const discountAmount = lineTotal * 0.10;
                lineTotal -= discountAmount;
                savings += discountAmount;
                item.hasBulkDiscount = true;
            } else {
                item.hasBulkDiscount = false;
            }
            
            subtotal += lineTotal;
        });

        // Business Discount
        let businessDiscount = 0;
        if (userRole === 'business') {
            businessDiscount = subtotal * 0.05;
            subtotal -= businessDiscount;
            savings += businessDiscount;
        }

        const shipping = subtotal > 0 ? 50 : 0;
        const tax = subtotal * 0.12;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total, savings, businessDiscount };
    },

    /* -------------------------------------
       Function: updateCartCount
       Description: Updates the red badge on the navbar cart icon
       ------------------------------------- */
    updateCartCount() {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            const cart = this.getCart();
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCountEl.textContent = totalItems;
            cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
};

/* =========================================
   Event: DOMContentLoaded
   Description: Initialize cart count on load
   ========================================= */
document.addEventListener('DOMContentLoaded', () => CartManager.updateCartCount());