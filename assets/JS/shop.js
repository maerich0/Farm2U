/* =========================================
   Event: DOMContentLoaded
   Description: Initialize shop page components
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    initShop();
});

let currentCategory = 'all';
let currentSort = 'default';
let currentPage = 1;
const itemsPerPage = 12;

/* =========================================
   Function: initShop
   Description: Sets up initial filters and event listeners
   ========================================= */
function initShop() {
    const allProducts = ProductManager.getAll();
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (categoryParam) currentCategory = categoryParam;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.category === currentCategory) btn.classList.add('active');
        
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            currentPage = 1;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderShop();
        });
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderShop();
    });

    renderShop(searchParam);
}

/* =========================================
   Function: renderShop
   Description: Filters and renders products grid
   ========================================= */
function renderShop(searchTerm = null) {
    let filtered = ProductManager.getAll();

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (searchTerm) {
        filtered = ProductManager.getAll().filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        const allBtn = document.querySelector('[data-category="all"]');
        if(allBtn) allBtn.classList.add('active');
    }

    if (currentSort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filtered.slice(start, end);

    const countEl = document.getElementById('productsCount');
    if(countEl) countEl.textContent = filtered.length;

    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    if (paginatedItems.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px; color:#666;">No products found matching your criteria.</div>';
    } else {
        paginatedItems.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            card.dataset.name = product.name;
            card.dataset.price = formatCurrency(product.price);
            card.dataset.desc = product.desc;
            card.dataset.reviews = product.reviews;
            
            card.innerHTML = `
                <div class="image-wrap">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="card-body">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="price-row">
                        <span class="price">${formatCurrency(product.price)}</span>
                        <span class="sold">${product.sold || '0 sold'}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderPagination(Math.ceil(filtered.length / itemsPerPage));
}

/* =========================================
   Function: renderPagination
   Description: Creates pagination buttons
   ========================================= */
function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    
    if(totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "active" : "";
        btn.addEventListener("click", () => {
            currentPage = i;
            renderShop();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pagination.appendChild(btn);
    }
}