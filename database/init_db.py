import sqlite3

conn = sqlite3.connect('farm2go.db')
c = conn.cursor()

# Users table
c.execute('''
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('consumer', 'business', 'farmer'))
)
''')

# Farmers table
c.execute('''
CREATE TABLE farmer_details (
    farmer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    farm_name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)
''')

# Products table
c.execute('''
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    harvest_status TEXT,
    image_path TEXT,
    FOREIGN KEY (farmer_id) REFERENCES farmer_details(farmer_id)
)
''')

# Orders table
c.execute('''
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    discount_applied REAL DEFAULT 0,
    order_status TEXT DEFAULT 'Pre-Harvest',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)
''')

# Order items table
c.execute('''
CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
)
''')

# Coupons table
c.execute('''
CREATE TABLE coupons (
    coupon_id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_code TEXT UNIQUE NOT NULL,
    discount_percent REAL NOT NULL,
    is_active INTEGER DEFAULT 1
)
''')

# Receipts table
c.execute('''
CREATE TABLE receipts (
    receipt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
)
''')

c.executescript('''
        INSERT INTO users (name, email, password, role) VALUES
        ('Erich Santos', 'erich@example.com', 'test123', 'consumer'),
        ('Juan Dela Cruz', 'juan@example.com', 'test123', 'business'),
        ('Maria Farmer', 'maria@example.com', 'test123', 'farmer');

        INSERT INTO farmer_details (user_id, farm_name, location, description) VALUES
        (3, 'Maria''s Organic Farm', 'Tagaytay', 'Fresh organic vegetables and fruits');

        INSERT INTO products (farmer_id, name, price, stock, harvest_status, image_path) VALUES
        (1, 'Tomatoes', 120.00, 50, 'Ready to Harvest', 'static/images/placeholder.png'),
        (1, 'Lettuce', 80.00, 30, 'In Growth', 'static/images/placeholder.png'),
        (1, 'Carrots', 100.00, 40, 'Ready to Harvest', 'static/images/placeholder.png');

        INSERT INTO coupons (coupon_code, discount_percent, is_active) VALUES
        ('F2G10', 10, 1),
        ('WELCOME5', 5, 1);
        ''')

conn.commit()
conn.close()
print("Database initialized successfully!")
