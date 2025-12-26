import sqlite3

conn = sqlite3.connect('farm2go.db')
c = conn.cursor()

coupons = [
    ('FARM10', 10.0, 1),  # 10% off
    ('NEWUSER5', 5.0, 1),  # 5% off
]

for code, percent, active in coupons:
    c.execute('INSERT OR IGNORE INTO coupons (coupon_code, discount_percent, is_active) VALUES (?, ?, ?)', (code, percent, active))

conn.commit()
conn.close()
print("Sample coupons added!")
