from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

SERVICES = {
    "users": "http://host.docker.internal:5051/api",
    "products": "http://host.docker.internal:5050/api",
   "sales": "http://host.docker.internal:5052/api"
}


# -----------------------
# HELPER: FORWARD REQUEST
# -----------------------
def forward_request(service, path, method="GET", data=None, params=None):
    try:
        url = f"{SERVICES[service]}{path}"
        response = requests.request(
            method,
            url,
            json=data,
            params=params,
            headers={k: v for k, v in request.headers if k != "Host"}  # pass headers except Host
        )

        # ✅ Try parsing response as JSON
        try:
            return response.json(), response.status_code
        except ValueError:
            # Not JSON, return text as JSON
            return {"message": response.text}, response.status_code

    except Exception as e:
        return {"error": str(e)}, 500


# -----------------------
# GATEWAY ROUTES
# -----------------------

@app.route("/api/users/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def gateway_users(path):
    return forward_request("users", f"/{path}", request.method, request.get_json(silent=True), request.args)


# PRODUCTS
@app.route("/api/products", methods=["GET", "POST"])
def gateway_products_root():
    return forward_request("products", "/products", request.method, request.get_json(silent=True), request.args)

@app.route("/api/products/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def gateway_products(path):
    return forward_request("products", f"/products/{path}", request.method, request.get_json(silent=True), request.args)


# SALES
@app.route("/api/sales", methods=["GET", "POST"])
def gateway_sales_root():
    return forward_request("sales", "/sales", request.method, request.get_json(silent=True), request.args)

@app.route("/api/sales/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def gateway_sales(path):
    return forward_request("sales", f"/sales/{path}", request.method, request.get_json(silent=True), request.args)

# Default route (when the service root is accessed: e.g. /api/products)
@app.route("/api/<service>", methods=["GET", "POST"])
def gateway_base(service):
    if service in SERVICES:
        return forward_request(service, "", request.method, request.get_json(silent=True), request.args)
    return {"error": "Service not found"}, 404


# -----------------------
# HEALTH CHECK ENDPOINT
# -----------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    results = {}
    for service, base_url in SERVICES.items():
        try:
            r = requests.get(base_url)  # try hitting service root
            results[service] = "UP" if r.status_code < 500 else "DOWN"
        except Exception:
            results[service] = "DOWN"
    return jsonify(results), 200


# -----------------------
# MAIN
# -----------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5054, debug=True)