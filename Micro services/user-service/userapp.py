import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# CORS only for Angular app
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# SQLite database for users
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///new_users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ------------------- USER MODEL -------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # e.g. "admin", "user"
    is_active = db.Column(db.Boolean, nullable=False, default=True)

# ------------------- AUTH ROUTES -------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        if not user.is_active:
            return jsonify({'message': 'User is blocked', 'loggedIn': False}), 403
        return jsonify({'message': 'Login successful', 'role': user.role, 'loggedIn': True}), 200
    else:
        return jsonify({'message': 'Invalid username or password', 'loggedIn': False}), 401


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')  # default role: "user"
    
    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400
    
    email_regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if not re.match(email_regex, email):
        return jsonify({'message': 'Invalid email format'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already in use'}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, password=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# ------------------- USER ADMIN MANAGEMENT -------------------
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active
        }
        for user in users
    ]
    return jsonify(user_list)


@app.route('/api/users/<int:user_id>/block', methods=['PUT'])
def block_user(user_id):
    user = User.query.get(user_id)
    if user:
        user.is_active = False
        db.session.commit()
        return jsonify({'message': 'User blocked successfully'})
    return jsonify({'message': 'User not found'}), 404


@app.route('/api/users/<int:user_id>/unblock', methods=['PUT'])
def unblock_user(user_id):
    user = User.query.get(user_id)
    if user:
        user.is_active = True
        db.session.commit()
        return jsonify({'message': 'User unblocked successfully'})
    return jsonify({'message': 'User not found'}), 404


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if "username" in data:
        if User.query.filter_by(username=data['username']).first() and user.username != data['username']:
            return jsonify({'message': 'Username already exists'}), 400
        user.username = data['username']

    if "email" in data:
        if User.query.filter_by(email=data['email']).first() and user.email != data['email']:
            return jsonify({'message': 'Email already in use'}), 400
        user.email = data['email']

    if "role" in data:
        user.role = data['role']

    if "password" in data:
        user.password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    db.session.commit()
    return jsonify({'message': 'User updated successfully'})


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})

# ------------------- MAIN -------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5051, debug=True)