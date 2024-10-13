from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
import pymysql
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

# Load environment variables
load_dotenv()
password = os.getenv('PASSWORD')

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Allow credentials and all origins

# Database Configuration using PyMySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = password
app.config['MYSQL_DB'] = 'user_auth'

# Function to establish a database connection
def get_db_connection():
    return pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB']
    )

# Apply CORS headers to all responses
@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# Signup Route
@app.route('/signup', methods=['POST'])
def signup(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    username = request.json['username']
    email = request.json['email']
    password = request.json['password']
    hashed_password = generate_password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
                is_teacher INT NOT NULL
            )
        ''')
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", 
                       (username, email, hashed_password))
        connection.commit()
        response = jsonify({"message": "User created successfully!"}), 201
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except pymysql.MySQLError as e:
        response = jsonify({"message": f"An error occurred: {e}"}), 500
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    finally:
        cursor.close()
        connection.close()

# Login Route
@app.route('/login', methods=['POST'])
def login(response):
    username = request.json['username']
    password = request.json['password']

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user[2], password):
            response = jsonify({"message": "Login successful!"}), 200
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        else:
            response = jsonify({"message": "Invalid credentials!"}), 401
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
    except pymysql.MySQLError as e:
        print(f"SQL Error: {e}")  # Log the SQL error
        response = jsonify({"message": f"An error occurred: {e}"}), 500
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True)
