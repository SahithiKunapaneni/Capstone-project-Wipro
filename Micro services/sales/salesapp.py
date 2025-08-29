from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import datetime
import traceback

import os
app = Flask(__name__)

# Allow CORS for frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# SQLite config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sales.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# ---------------------------
# MODELS
# ---------------------------
class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)
    total_price = db.Column(db.Float, nullable=False)
    sale_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    payment_method = db.Column(db.String(50), nullable=False, default="Unknown")
    customer_info = db.Column(db.String(255), nullable=False, default="Unknown")
    items = db.relationship('SaleItem', backref='sale', lazy=True, cascade="all, delete-orphan")


class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)


# Create tables
def create_app():
    with app.app_context():
        db.create_all()
    return app


app = create_app()

# ---------------------------
# INVENTORY SERVICE URL
# ---------------------------
# INVENTORY_SERVICE_URL = "http://127.0.0.1:5050/api/products"
# INVENTORY_SERVICE_URL = "http://inventory-service:5050/api/products"

INVENTORY_SERVICE_URL = os.getenv("INVENTORY_SERVICE_URL", "http://127.0.0.1:5050/api/products")

# ---------------------------
# ROUTES
# ---------------------------
@app.route('/api/sales/products', methods=['GET'])
def get_products():
    response = requests.get(INVENTORY_SERVICE_URL)
    return jsonify(response.json()), response.status_code


@app.route('/api/sales/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    response = requests.get(f"{INVENTORY_SERVICE_URL}/{product_id}")
    return jsonify(response.json()), response.status_code


@app.route('/api/sales/history/<int:sale_id>', methods=['GET'])
def get_sale_details(sale_id):
    try:
        sale = Sale.query.get(sale_id)
        if not sale:
            return jsonify({'message': 'Sale not found'}), 404

        items = [{
            'product_id': item.product_id,
            'name': item.product_name,
            'quantity': item.quantity,
            'price': item.price,
            'total_price': item.total_price
        } for item in sale.items]

        sale_details = {
            'id': sale.id,
            'total_price': sale.total_price,
            'sale_date': sale.sale_date.isoformat(),
            'payment_method': sale.payment_method,
            'customer_info': sale.customer_info,
            'items': items
        }
        return jsonify(sale_details)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales/checkout', methods=['POST'])
def checkout():
    try:
        data = request.get_json()

        # ✅ Defaults if not provided
        payment_method = data.get('payment_method', 'Unknown')
        customer_info = data.get('customer_info', 'Unknown')
        items = data.get('items', [])

        if not items:
            return jsonify({'message': 'No items in checkout'}), 400

        total_sale_price = 0
        sale_items = []

        # Validate products and update stock
        for item in items:
            product_id = item.get('product_id')
            quantity = item.get('quantity')

            product_response = requests.get(f"{INVENTORY_SERVICE_URL}/{product_id}")
            if product_response.status_code != 200:
                return jsonify({'message': f'Product {product_id} not found'}), 404

            product = product_response.json()

            if product['stock'] < quantity:
                return jsonify({'message': f'Insufficient stock for product {product_id}'}), 400

            # Update stock in inventory
            new_stock = product['stock'] - quantity
            update_response = requests.put(
                f"{INVENTORY_SERVICE_URL}/{product_id}",
                json={'stock': new_stock}
            )
            if update_response.status_code != 200:
                return jsonify({'message': 'Failed to update stock'}), 500

            item_total_price = product['price'] * quantity
            total_sale_price += item_total_price

            sale_items.append({
                'product_id': product_id,
                'product_name': product['name'],
                'quantity': quantity,
                'price': product['price'],
                'total_price': item_total_price
            })

        # Create one Sale record per checkout
        sale = Sale(
            total_price=total_sale_price,
            payment_method=payment_method if payment_method else "Unknown",
            customer_info=customer_info if customer_info else "Unknown"
        )
        db.session.add(sale)
        db.session.flush()  # generate sale.id

        # Add SaleItem records
        for item in sale_items:
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item['product_id'],
                product_name=item['product_name'],
                quantity=item['quantity'],
                price=item['price'],
                total_price=item['total_price']
            )
            db.session.add(sale_item)

        db.session.commit()

        return jsonify({
            'message': 'Checkout successful',
            'saleId': sale.id
        }), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales/history', methods=['GET'])
def get_sales_history():
    try:
        sales = Sale.query.all()
        sales_list = []

        for sale in sales:
            items = [{
                'product_id': item.product_id,
                'name': item.product_name,
                'quantity': item.quantity,
                'price': item.price,
                'total_price': item.total_price
            } for item in sale.items]

            sales_list.append({
                'id': sale.id,
                'total_price': sale.total_price,
                'sale_date': sale.sale_date.isoformat(),
                'payment_method': sale.payment_method,
                'customer_info': sale.customer_info,
                'items': items
            })

        return jsonify(sales_list)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales/<int:sale_id>', methods=['DELETE'])
def delete_sale(sale_id):
    try:
        sale = Sale.query.get(sale_id)
        if not sale:
            return jsonify({'message': f'Sale with ID {sale_id} not found'}), 404

        # Cascade delete will remove SaleItems too
        db.session.delete(sale)
        db.session.commit()

        return jsonify({'message': f'Sale {sale_id} deleted successfully'}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
# ---------------------------
# APP ENTRYPOINT
# ---------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5052, debug=True)