import sqlite3

conn = sqlite3.connect('farm2go.db')
c = conn.cursor()

# Sample farmer (assume user_id=1 is a farmer)
c.execute("INSERT OR IGNORE INTO farmers (user_id, farm_name, location, description) VALUES (1, 'Green Valley Farm', 'Tagaytay', 'Organic vegetables')")

# Sample products
products = [
    (1, 'Fresh Lettuce', 50.0, 100, 'Ready', 'static/images/lettuce.png'),
    (1, 'Tomatoes', 80.0, 50, 'Harvesting', 'static/images/tomatoes.png'),
    (1, 'Carrots', 60.0, 70, 'Pre-Harvest', 'static/images/carrots.png'),
]

for p in products:
    c.execute('INSERT INTO products (farmer_id, name, price, stock, harvest_status, image_path) VALUES (?, ?, ?, ?, ?, ?)', p)

conn.commit()
conn.close()
print("Sample products added!")
