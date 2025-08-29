from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///products.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(100), nullable=False)
    minimum_stock = db.Column(db.Integer, nullable=False)

def create_app():
    with app.app_context():
        db.create_all()
    return app

app = create_app()

@app.route('/api/products', methods=['POST', 'OPTIONS'])
def add_product():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight OK"}), 200

    data = request.get_json()

    # Validate input
    if not isinstance(data.get('name'), str) or not data.get('name').strip():
        return jsonify({'message': 'Invalid name'}), 400

    if Product.query.filter_by(name=data['name'].strip()).first():
        return jsonify({'message': 'Product with this name already exists'}), 400

    if not isinstance(data.get('price'), int) or data.get('price') <= 0:
        return jsonify({'message': 'Invalid price'}), 400

    if not isinstance(data.get('stock'), int) or data.get('stock') < 0:
        return jsonify({'message': 'Invalid stock'}), 400

    if not isinstance(data.get('category'), str) or not data.get('category').strip():
        return jsonify({'message': 'Invalid category'}), 400

    if not isinstance(data.get('minimum_stock'), int) or data.get('minimum_stock') < 0:
        return jsonify({'message': 'Invalid minimum stock'}), 400

    # Add new product
    new_product = Product(
        name=data['name'].strip(),
        price=data['price'],
        stock=data['stock'],
        description=data.get('description', '').strip(),
        category=data['category'].strip(),
        minimum_stock=data['minimum_stock']
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully'}), 201

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    product_list = [
        {
            'id': p.id, 'name': p.name, 'price': p.price,
            'stock': p.stock, 'description': p.description,
            'category': p.category, 'minimum_stock': p.minimum_stock
        }
        for p in products
    ]
    return jsonify(product_list)

@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def handle_product(product_id):
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight OK"}), 200

    product = Product.query.get(product_id)

    if request.method == 'GET':
        if product:
            return jsonify({
                'id': product.id, 'name': product.name, 'price': product.price,
                'stock': product.stock, 'description': product.description,
                'category': product.category, 'minimum_stock': product.minimum_stock
            })
        return jsonify({'message': 'Product not found'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        if not product:
            return jsonify({'message': 'Product not found'}), 404

        # Validation logic
        if 'name' in data and (not isinstance(data['name'], str) or not data['name'].strip()):
            return jsonify({'message': 'Invalid name'}), 400

        if 'name' in data and product.name != data['name'] and Product.query.filter_by(name=data['name'].strip()).first():
            return jsonify({'message': 'Product with this name already exists'}), 400

        if 'price' in data and (not isinstance(data['price'], int) or data['price'] <= 0):
            return jsonify({'message': 'Invalid price'}), 400

        if 'stock' in data and (not isinstance(data['stock'], int) or data['stock'] < 0):
            return jsonify({'message': 'Invalid stock'}), 400

        if 'category' in data and (not isinstance(data['category'], str) or not data['category'].strip()):
            return jsonify({'message': 'Invalid category'}), 400

        if 'minimum_stock' in data and (not isinstance(data['minimum_stock'], int) or data['minimum_stock'] < 0):
            return jsonify({'message': 'Invalid minimum stock'}), 400

        # Update product details
        if 'name' in data:
            product.name = data['name'].strip()
        if 'price' in data:
            product.price = data['price']
        if 'stock' in data:
            product.stock = data['stock']
        if 'description' in data:
            product.description = data['description'].strip()
        if 'category' in data:
            product.category = data['category'].strip()
        if 'minimum_stock' in data:
            product.minimum_stock = data['minimum_stock']

        db.session.commit()
        return jsonify({'message': 'Product updated successfully'})

    if request.method == 'DELETE':
        if product:
            db.session.delete(product)
            db.session.commit()
            return jsonify({'message': 'Product deleted successfully'})
        return jsonify({'message': 'Product not found'}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)