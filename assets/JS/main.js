/* =========================================
   Event: DOMContentLoaded
   Description: Initializes global UI components
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    setupHeader();
    setupMobileMenu();
    setupProductModals();
    setupSearch();
    setupWelcomeModal();
});

/* =========================================
   Function: setupHeader
   Description: Toggles sticky header class on scroll
   ========================================= */
function setupHeader() {
    const header = document.querySelector("header");
    window.addEventListener("scroll", function(){
        header.classList.toggle("sticky", window.scrollY > 0);
    });
}

/* =========================================
   Function: setupMobileMenu
   Description: Toggles mobile navigation menu
   ========================================= */
function setupMobileMenu() {
    const menuIcon = document.getElementById('menu-icon');
    const navbar = document.querySelector('.navbar');
    
    if(menuIcon && navbar) {
        menuIcon.addEventListener('click', () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('open');
        });
    }
}

/* =========================================
   Function: setupProductModals
   Description: Handles global product card clicks to open modal
   ========================================= */
function setupProductModals() {
    const modal = document.getElementById("productModal");
    if (!modal) return;

    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
            const img = card.querySelector("img").src;
            const name = card.dataset.name || card.querySelector(".product-title").innerText;
            const price = card.dataset.price || card.querySelector(".price").innerText;
            const desc = card.dataset.desc || "Fresh organic produce.";
            const reviews = card.dataset.reviews || "⭐⭐⭐⭐☆";

            document.getElementById("modalImg").src = img;
            document.getElementById("modalName").textContent = name;
            document.getElementById("modalPrice").textContent = price;
            document.getElementById("modalDesc").textContent = desc;
            document.getElementById("modalReviews").textContent = reviews;

            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
        }
    });

    const closeBtn = modal.querySelector(".modal-close");
    if(closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    const cartBtn = modal.querySelector('.cart-btn');
    if (cartBtn) {
        const newBtn = cartBtn.cloneNode(true);
        cartBtn.parentNode.replaceChild(newBtn, cartBtn);
        
        newBtn.addEventListener('click', () => {
            const name = document.getElementById("modalName").textContent;
            const price = document.getElementById("modalPrice").textContent;
            const image = document.getElementById("modalImg").src;
            
            CartManager.addItem({ name, price, image });
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }
}

/* =========================================
   Function: setupSearch
   Description: Creates and handles the search overlay
   ========================================= */
function setupSearch() {
    const searchIcon = document.getElementById('searchIcon');
    if(!searchIcon) return;

    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.style.cssText = `display:none; position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:5000; align-items:center; justify-content:center;`;
    searchOverlay.innerHTML = `
        <div class="search-box" style="background:white; padding:30px; border-radius:12px; width:90%; max-width:600px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h3>Search Products</h3>
                <span class="close-search" style="cursor:pointer; font-size:24px;">&times;</span>
            </div>
            <input type="text" id="globalSearchInput" placeholder="Search..." style="width:100%; padding:15px; border:1px solid #ddd; border-radius:8px;">
            <div id="globalSearchResults" style="max-height:300px; overflow-y:auto; margin-top:20px;"></div>
        </div>
    `;
    document.body.appendChild(searchOverlay);

    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.style.display = 'flex';
        document.getElementById('globalSearchInput').focus();
    });

    searchOverlay.querySelector('.close-search').addEventListener('click', () => {
        searchOverlay.style.display = 'none';
    });

    const input = document.getElementById('globalSearchInput');
    const resultsContainer = document.getElementById('globalSearchResults');

    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        if(term.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const allProducts = typeof ProductManager !== 'undefined' ? ProductManager.getAll() : [];
        
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term)
        );
        
        if(filtered.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align:center; padding:15px; color:#666;">No products found.</p>';
        } else {
            resultsContainer.innerHTML = filtered.map(p => `
                <div class="search-item" style="display:flex; gap:15px; padding:15px; border-bottom:1px solid #eee; cursor:pointer; align-items:center; transition:0.2s;" 
                     onclick="window.location.href='shop.html?search=${p.name}'"
                     onmouseover="this.style.background='#f9f9f9'" 
                     onmouseout="this.style.background='white'">
                    <img src="${p.image}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">
                    <div>
                        <h4 style="margin:0; font-size:15px; color:#333;">${p.name}</h4>
                        <p style="margin:0; font-size:13px; color:var(--main-color); font-weight:600;">₱${p.price.toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
        }
    });
}

/* =========================================
   Function: setupWelcomeModal
   Description: Handles the welcome info modal on homepage
   ========================================= */
function setupWelcomeModal() {
    const welcomeModal = document.getElementById("welcomeModal");
    const learnMoreBtn = document.querySelector(".home .btn");
    
    if (welcomeModal && learnMoreBtn) {
        learnMoreBtn.addEventListener("click", (e) => {
            e.preventDefault();
            welcomeModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });

        welcomeModal.querySelector(".modal-close").addEventListener("click", () => {
            welcomeModal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }
}