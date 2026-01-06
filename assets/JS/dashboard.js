/* =========================================
   Object: DashboardManager
   Description: Controls all dashboard views and logic
   ========================================= */
const DashboardManager = {
    
    /* -------------------------------------
       Function: open
       Description: Creates and displays the dashboard overlay
       ------------------------------------- */
    open() {
        const user = AuthManager.getCurrentUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        if(document.getElementById('dashOverlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'dashboard-overlay';
        overlay.id = 'dashOverlay';
        
        let sidebarItems = `
            <li onclick="DashboardManager.renderHome()"><i class="ri-home-line"></i> Overview</li>
            <li onclick="DashboardManager.renderOrders()"><i class="ri-file-list-3-line"></i> Order History</li>
        `;

        if (user.role === 'farmer') {
            sidebarItems += `<li onclick="DashboardManager.renderProducts()"><i class="ri-plant-line"></i> My Products</li>`;
        }

        overlay.innerHTML = `
            <div class="dash-card">
                <div class="dash-sidebar">
                    <div class="user-profile">
                        <div class="user-avatar">
                            <i class="${user.role === 'farmer' ? 'ri-plant-fill' : user.role === 'business' ? 'ri-briefcase-fill' : 'ri-user-fill'}"></i>
                        </div>
                        <h3>${user.name}</h3>
                        <p class="user-role">${user.role.toUpperCase()}</p>
                    </div>
                    <ul class="dash-menu">
                        ${sidebarItems}
                        <li onclick="window.location.href='cart.html'"><i class="ri-shopping-cart-line"></i> Go to Cart</li>
                    </ul>
                    <button class="logout-btn" onclick="AuthManager.logout()"><i class="ri-logout-box-line"></i> Logout</button>
                    <button class="close-dash-btn" onclick="DashboardManager.close()">Close</button>
                </div>
                <div class="dash-main" id="dashContent">
                    </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        this.renderHome();
    },

    /* -------------------------------------
       Function: close
       Description: Removes dashboard from DOM
       ------------------------------------- */
    close() {
        const overlay = document.getElementById('dashOverlay');
        if (overlay) overlay.remove();
        document.body.style.overflow = 'auto';
    },

    /* -------------------------------------
       Function: renderHome
       Description: Displays the Overview tab with stats
       ------------------------------------- */
    renderHome() {
        const user = AuthManager.getCurrentUser();
        const content = document.getElementById('dashContent');
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const myOrders = orders.filter(o => o.userEmail === user.email);
        
        const totalSpent = myOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = myOrders.length;
        const totalSavings = user.role === 'business' ? (totalSpent * 0.05).toFixed(2) : 0;

        let html = `
            <div class="dash-header">
                <h2>Dashboard Overview</h2>
                <span class="date">${new Date().toLocaleDateString()}</span>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background:#e0f2fe; color:#0284c7;"><i class="ri-shopping-bag-3-line"></i></div>
                    <div>
                        <h3>${totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#dcfce7; color:#166534;"><i class="ri-money-dollar-circle-line"></i></div>
                    <div>
                        <h3>₱${totalSpent.toFixed(2)}</h3>
                        <p>Total Spent</p>
                    </div>
                </div>
        `;

        if (user.role === 'business') {
            html += `
                <div class="stat-card">
                    <div class="stat-icon" style="background:#fef9c3; color:#854d0e;"><i class="ri-medal-line"></i></div>
                    <div>
                        <h3>₱${totalSavings}</h3>
                        <p>Business Savings</p>
                    </div>
                </div>
            `;
        }

        html += `</div>`;

        html += `
            <h3 style="margin-top:30px; margin-bottom:15px;">Recent Activity</h3>
            ${myOrders.length === 0 
                ? '<p style="color:#666;">No orders placed yet. <a href="shop.html" style="color:var(--main-color);">Start Shopping!</a></p>' 
                : this.generateOrderTable(myOrders.slice(0, 3)) 
            }
        `;

        content.innerHTML = html;
    },

    /* -------------------------------------
       Function: renderOrders
       Description: Displays the Order History tab
       ------------------------------------- */
    renderOrders() {
        const user = AuthManager.getCurrentUser();
        const content = document.getElementById('dashContent');
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const myOrders = orders.filter(o => o.userEmail === user.email).reverse();

        content.innerHTML = `
            <h2>Order History</h2>
            <div style="margin-top:20px;">
                ${myOrders.length === 0 
                    ? '<p>No orders found.</p>' 
                    : this.generateOrderTable(myOrders)
                }
            </div>
        `;
    },

    /* -------------------------------------
       Function: renderProducts
       Description: Displays Farmer's products table
       ------------------------------------- */
    renderProducts() {
        const user = AuthManager.getCurrentUser();
        const products = ProductManager.getByOwner(user.id);
        const content = document.getElementById('dashContent');
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>My Farm Products</h2>
                <button class="btn" onclick="DashboardManager.renderAddForm()">+ Add Product</button>
            </div>
            <table class="product-table">
                <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
        `;
        products.forEach(p => {
            html += `<tr>
                <td><img src="${p.image}" style="width:40px; height:40px; object-fit:cover;"></td>
                <td>${p.name}</td>
                <td>₱${p.price}</td>
                <td><button class="action-btn delete-btn" onclick="DashboardManager.deleteProduct(${p.id})">Delete</button></td>
            </tr>`;
        });
        html += `</tbody></table>`;
        content.innerHTML = html;
    },

    /* -------------------------------------
       Function: renderAddForm
       Description: Displays form to add new products (Removed Dairy/Grains)
       ------------------------------------- */
    renderAddForm() {
        const content = document.getElementById('dashContent');
        content.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <i class="ri-arrow-left-line" style="cursor:pointer; font-size: 24px;" onclick="DashboardManager.renderProducts()"></i>
                <h2>Add New Product</h2>
            </div>
            <form id="addProductForm" class="add-product-form">
                <div class="input-group">
                    <label>Product Name</label>
                    <input type="text" id="prodName" required placeholder="e.g., Organic Chicken">
                </div>
                <div class="form-row">
                    <div class="input-group">
                        <label>Price (₱)</label>
                        <input type="number" id="prodPrice" required placeholder="0.00">
                    </div>
                    <div class="input-group">
                        <label>Category</label>
                        <select id="prodCat" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; background:white;">
                            <option value="vegetables">Vegetables</option>
                            <option value="fruits">Fruits</option>
                            <option value="meats">Meats</option>
                        </select>
                    </div>
                </div>
                <div class="input-group">
                    <label>Image URL</label>
                    <input type="text" id="prodImg" placeholder="assets/images/test.png">
                    <small style="color:#999;">Leave empty for default image</small>
                </div>
                 <div class="input-group">
                    <label>Description</label>
                    <textarea id="prodDesc" rows="3" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;"></textarea>
                </div>
                <button type="submit" class="btn" style="width:100%;">Publish Product</button>
            </form>
        `;

        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });
    },

    /* -------------------------------------
       Function: handleProductSubmit
       Description: Saves the new product to localStorage
       ------------------------------------- */
    handleProductSubmit() {
        const user = AuthManager.getCurrentUser();
        const newProduct = {
            name: document.getElementById('prodName').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            category: document.getElementById('prodCat').value,
            image: 'assets/images/test.png',
            desc: 'Freshly harvested'
        };
        ProductManager.add(newProduct, user.id);
        this.renderProducts();
    },

    /* -------------------------------------
       Function: deleteProduct
       Description: Removes a product from the database
       ------------------------------------- */
    deleteProduct(id) {
        ProductManager.delete(id);
        this.renderProducts();
    },

    /* -------------------------------------
       Function: generateOrderTable
       Description: Helper to create HTML string for order tables
       ------------------------------------- */
    generateOrderTable(orderList) {
        let html = `
            <table class="product-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        orderList.forEach(order => {
            html += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>₱${order.total.toFixed(2)}</td>
                    <td><span class="discount-tag" style="background:#dbeafe; color:#1e40af;">Processing</span></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        return html;
    }
};