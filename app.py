from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'paolobog'

DATABASE = 'farm2u.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

# -------------------
# User Registration
# -------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        role = request.form['role']

        conn = get_db_connection()
        try:
            conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                         (name, email, password, role))
            conn.commit()
        except sqlite3.IntegrityError:
            flash('Email already registered.', 'danger')
            return redirect(url_for('register'))

        # If farmer, create entry in farmer_details
        if role == 'farmer':
            user = conn.execute('SELECT user_id FROM users WHERE email = ?', (email,)).fetchone()
            conn.execute('INSERT INTO farmer_details (user_id, farm_name) VALUES (?, ?)', (user['user_id'], f"{name}'s Farm"))
            conn.commit()
        conn.close()
        flash('Registration successful. Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

# -------------------
# User Login
# -------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()

        if user and user['password'] == password:  # plain text for testing
            session['user_id'] = user['user_id']
            session['name'] = user['name']
            session['role'] = user['role']
            flash('Login successful!', 'success')
            return redirect(url_for('shop'))
        else:
            flash('Invalid email or password', 'danger')
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('login'))

# -------------------
# Shop
# -------------------
@app.route('/shop')
def shop():
    conn = get_db_connection()
    products = conn.execute('SELECT p.*, f.farm_name, f.farmer_id FROM products p JOIN farmer_details f ON p.farmer_id = f.farmer_id').fetchall()
    conn.close()
    return render_template('shop.html', products=products)

# -------------------
# Cart Routes
# -------------------
@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product_id = int(request.form['product_id'])
    quantity = int(request.form['quantity'])

    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE product_id = ?', (product_id,)).fetchone()
    conn.close()

    if not product:
        flash('Product not found', 'danger')
        return redirect(url_for('shop'))

    cart = session.get('cart', {})

    # If the item is already in the cart
    if str(product_id) in cart:
        # Update the quantity
        cart[str(product_id)]['quantity'] += quantity
    else:
        # Add new item with full info
        cart[str(product_id)] = {
            'name': product['name'],
            'price': product['price'],
            'quantity': quantity
        }

    session['cart'] = cart
    flash("Item added to cart!", "success")
    return redirect(url_for('view_cart'))




@app.route('/cart')
def view_cart():
    cart = session.get('cart', {})
    total = 0
    sanitized_cart = {}

    conn = get_db_connection()

    for product_id, item in cart.items():
        # If item is an int (old format), fetch product info
        if isinstance(item, int):
            product = conn.execute(
                'SELECT name, price FROM products WHERE product_id = ?',
                (product_id,)
            ).fetchone()
            if product:
                sanitized_cart[product_id] = {
                    'name': product['name'],
                    'price': product['price'],
                    'quantity': item
                }
        else:
            sanitized_cart[product_id] = item

        # Calculate subtotal for this item
        total += sanitized_cart[product_id]['price'] * sanitized_cart[product_id]['quantity']

    conn.close()

    # Update session cart with sanitized version
    session['cart'] = sanitized_cart

    return render_template('cart.html', cart=sanitized_cart, total=total)



@app.route('/update_cart/<int:product_id>', methods=['POST'])
def update_cart(product_id):
    quantity = int(request.form['quantity'])
    cart = session.get('cart', {})
    key = str(product_id)

    if key in cart:
        if quantity <= 0:
            del cart[key]
            flash('Item removed from cart.', 'info')
        else:
            cart[key]['quantity'] = quantity
            flash('Cart updated.', 'success')

    session['cart'] = cart
    return redirect(url_for('view_cart'))


# -------------------
# Checkout
# -------------------
@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    if 'user_id' not in session:
        flash('Please login to checkout.', 'warning')
        return redirect(url_for('login'))

    cart = session.get('cart', {})
    if not cart:
        flash('Your cart is empty.', 'warning')
        return redirect(url_for('shop'))

    # Calculate total
    total = sum(item['price'] * item['quantity'] for item in cart.values())
    discount_applied = 0

    if request.method == 'POST':
        coupon_code = request.form.get('coupon', '').strip()

        # Coupon logic
        if coupon_code:
            conn = get_db_connection()
            coupon = conn.execute('SELECT * FROM coupons WHERE coupon_code = ? AND is_active = 1', (coupon_code,)).fetchone()
            conn.close()
            if coupon:
                discount_applied = (coupon['discount_percent'] / 100) * total
                total -= discount_applied
                flash(f'Coupon {coupon_code} applied! Discount: ₱{discount_applied}', 'success')
            else:
                flash('Invalid or inactive coupon.', 'danger')

        # Business discount
        if session.get('role') == 'business':
            total_items = sum(item['quantity'] for item in cart.values())
            if total_items >= 5:
                business_discount = 0.1 * total
                total -= business_discount
                discount_applied += business_discount
                flash(f'Business bulk discount applied: ₱{business_discount}', 'success')

        # Insert order into database
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO orders (user_id, total_amount, discount_applied) VALUES (?, ?, ?)',
                    (session['user_id'], total, discount_applied))
        order_id = cur.lastrowid

        # Insert order items & update stock
        for product_id, item in cart.items():
            cur.execute('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                        (order_id, int(product_id), item['quantity'], item['price']))
            cur.execute('UPDATE products SET stock = stock - ? WHERE product_id = ?', (item['quantity'], int(product_id)))

        conn.commit()
        conn.close()

        session['cart'] = {}  # Clear cart
        flash('Order placed successfully!', 'success')
        return redirect(url_for('tracking'))

    return render_template('checkout.html', cart=cart, total=total)


# -------------------
# Order Tracking
# -------------------
@app.route('/tracking')
def tracking():
    if 'user_id' not in session:
        flash('Please login.', 'warning')
        return redirect(url_for('login'))

    conn = get_db_connection()
    orders = conn.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC', (session['user_id'],)).fetchall()
    conn.close()
    return render_template('tracking.html', orders=orders)

# Helper for template to fetch order items
@app.context_processor
def utility_processor():
    def order_items(order_id):
        conn = get_db_connection()
        items = conn.execute(
            'SELECT oi.quantity, oi.price_at_purchase, p.name '
            'FROM order_items oi JOIN products p ON oi.product_id = p.product_id '
            'WHERE oi.order_id = ?', (order_id,)
        ).fetchall()
        conn.close()
        return items
    return dict(order_items=order_items)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    conn = get_db_connection()

    product = conn.execute(
        '''
        SELECT products.*,
               farmer_details.farm_name
        FROM products
        JOIN farmer_details
          ON products.farmer_id = farmer_details.farmer_id
        WHERE products.product_id = ?
        ''',
        (product_id,)
    ).fetchone()

    conn.close()

    if not product:
        flash("Product not found.", "danger")
        return redirect(url_for('shop'))

    return render_template('product_detail.html', product=product)



# -------------------
# Farmer Dashboard
# -------------------
@app.route('/farmer/dashboard')
def farmer_dashboard():
    if 'user_id' not in session or session.get('role') != 'farmer':
        flash('Access denied.', 'danger')
        return redirect(url_for('login'))

    conn = get_db_connection()
    farmer = conn.execute('SELECT * FROM farmer_details WHERE user_id = ?', (session['user_id'],)).fetchone()
    products = conn.execute('SELECT * FROM products WHERE farmer_id = ?', (farmer['farmer_id'],)).fetchall()
    conn.close()
    return render_template('farmer_dashboard.html', products=products, farmer=farmer)

@app.route('/farmer/<int:farmer_id>')
def farmer_profile(farmer_id):
    conn = get_db_connection()
    farmer = conn.execute('SELECT * FROM farmer_details WHERE farmer_id = ?', (farmer_id,)).fetchone()
    products = conn.execute('SELECT * FROM products WHERE farmer_id = ?', (farmer_id,)).fetchall()
    conn.close()

    if not farmer:
        flash("Farmer not found.", "danger")
        return redirect(url_for('shop'))

    return render_template('farmer.html', farmer=farmer, products=products)


# -------------------
# Add/Edit/Delete Product Routes (Farmer)
# -------------------
@app.route('/farmer/add_product', methods=['GET', 'POST'])
def add_product():
    if 'user_id' not in session or session.get('role') != 'farmer':
        flash('Access denied.', 'danger')
        return redirect(url_for('login'))

    if request.method == 'POST':
        name = request.form['name']
        price = float(request.form['price'])
        stock = int(request.form['stock'])
        harvest_status = request.form['harvest_status']
        image_path = request.form['image_path']  # For simplicity

        conn = get_db_connection()
        farmer = conn.execute('SELECT farmer_id FROM farmer_details WHERE user_id = ?', (session['user_id'],)).fetchone()
        conn.execute('INSERT INTO products (farmer_id, name, price, stock, harvest_status, image_path) VALUES (?, ?, ?, ?, ?, ?)',
                     (farmer['farmer_id'], name, price, stock, harvest_status, image_path))
        conn.commit()
        conn.close()
        flash('Product added successfully!', 'success')
        return redirect(url_for('farmer_dashboard'))
    return render_template('add_product.html')
    
@app.route('/edit_product/<int:product_id>', methods=['GET', 'POST'])
def edit_product(product_id):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE product_id = ?', (product_id,)).fetchone()

    if not product:
        flash("Product not found.", "danger")
        return redirect(url_for('farmer_dashboard'))

    if request.method == 'POST':
        name = request.form['name']
        price = float(request.form['price'])
        stock = int(request.form['stock'])
        harvest_status = request.form['harvest_status']
        image_path = request.form['image_path']

        conn.execute('''
            UPDATE products
            SET name = ?, price = ?, stock = ?, harvest_status = ?, image_path = ?
            WHERE product_id = ?
        ''', (name, price, stock, harvest_status, image_path, product_id))
        conn.commit()
        conn.close()

        flash("Product updated successfully!", "success")
        return redirect(url_for('farmer_dashboard'))

    conn.close()
    return render_template('add_product.html', product=product)  # reuse form template

@app.route('/delete_product/<int:product_id>')
def delete_product(product_id):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE product_id = ?', (product_id,)).fetchone()

    if product:
        conn.execute('DELETE FROM products WHERE product_id = ?', (product_id,))
        conn.commit()
        flash("Product deleted successfully.", "success")
    else:
        flash("Product not found.", "danger")

    conn.close()
    return redirect(url_for('farmer_dashboard'))



# Edit & Delete product routes can be implemented similarly

# -------------------
# Run App
# -------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port="5000", debug=True)
