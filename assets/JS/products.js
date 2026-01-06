/* =========================================
   Variable: products
   Description: Initial seed data for the application
   ========================================= */
const products = [
    {
        id: 1,
        name: "Garlic",
        price: 5.00,
        desc: "Fresh organic garlic harvested locally. Perfect for everyday cooking.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/test.png",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 2,
        name: "Apple",
        price: 15.00,
        desc: "Fresh organic apple from local orchards. Crisp and juicy.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "fruits",
        image: "assets/images/apple.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 3,
        name: "Carrots",
        price: 8.00,
        desc: "Fresh organic carrots, rich in vitamins and perfect for salads.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/carrots.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 4,
        name: "Cucumber",
        price: 7.00,
        desc: "Fresh crisp cucumbers, perfect for salads and snacks.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/cucumber.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 5,
        name: "Potato",
        price: 10.00,
        desc: "Organic potatoes, versatile for various dishes.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/potato.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 6,
        name: "Strawberry",
        price: 25.00,
        desc: "Sweet organic strawberries, perfect for desserts.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "fruits",
        image: "assets/images/strawberry.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 7,
        name: "Onions",
        price: 8.00,
        desc: "Fresh onions, essential for cooking.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/onions.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 8,
        name: "Orange",
        price: 18.00,
        desc: "Juicy oranges, rich in vitamin C.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "fruits",
        image: "assets/images/orange.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 9,
        name: "Lettuce",
        price: 7.00,
        desc: "Fresh green lettuce for salads.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/lettuce.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 10,
        name: "Tomato",
        price: 12.00,
        desc: "Ripe tomatoes, perfect for sauces and salads.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/tomato.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 11,
        name: "Eggplant",
        price: 9.00,
        desc: "Fresh eggplants, great for various dishes.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/eggplant.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 12,
        name: "Cabbage",
        price: 11.00,
        desc: "Fresh cabbage for salads and cooking.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/cabbage.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    },
    {
        id: 13,
        name: "Bell Pepper",
        price: 14.00,
        desc: "Colorful bell peppers, rich in vitamins.",
        reviews: "⭐⭐⭐⭐☆ (1.2k reviews)",
        category: "vegetables",
        image: "assets/images/bp.jpg",
        sold: "10K+ sold",
        ownerId: "admin"
    }
];

/* =========================================
   Object: ProductManager
   Description: Handles CRUD operations for products using localStorage
   ========================================= */
const ProductManager = {
    
    /* -------------------------------------
       Function: init
       Description: Seeds localStorage if empty
       ------------------------------------- */
    init() {
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify(products));
        }
    },

    /* -------------------------------------
       Function: getAll
       Description: Retrieves all products from storage
       ------------------------------------- */
    getAll() {
        this.init();
        return JSON.parse(localStorage.getItem('products'));
    },

    /* -------------------------------------
       Function: getByOwner
       Description: Filters products by the creator's ID (for Farmers)
       ------------------------------------- */
    getByOwner(ownerId) {
        const products = this.getAll();
        return products.filter(p => p.ownerId === ownerId);
    },

    /* -------------------------------------
       Function: add
       Description: Adds a new product to storage
       ------------------------------------- */
    add(product, ownerId) {
        const products = this.getAll();
        const newProduct = {
            id: Date.now(),
            ownerId: ownerId,
            sold: "0 sold",
            reviews: "New Arrival",
            ...product
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        return true;
    },

    /* -------------------------------------
       Function: update
       Description: Updates an existing product
       ------------------------------------- */
    update(id, updatedData) {
        let products = this.getAll();
        const index = products.findIndex(p => p.id == id);
        if (index > -1) {
            products[index] = { ...products[index], ...updatedData };
            localStorage.setItem('products', JSON.stringify(products));
            return true;
        }
        return false;
    },

    /* -------------------------------------
       Function: delete
       Description: Removes a product from storage
       ------------------------------------- */
    delete(id) {
        let products = this.getAll();
        const newProducts = products.filter(p => p.id != id);
        localStorage.setItem('products', JSON.stringify(newProducts));
    }
};