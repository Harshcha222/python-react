import os
from flask import Flask
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from flask_cors import CORS


from models import db, migrate
from models.model import User, Book, Transaction 


load_dotenv()


app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

db.init_app(app)
migrate.init_app(app, db)
jwt = JWTManager(app)
CORS(app)


from routes.sign_up import auth_bp
from routes.books import books_bp
from routes.transactions import transactions_bp


app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(books_bp, url_prefix='/books')
app.register_blueprint(transactions_bp, url_prefix='/transactions')


if __name__ == '__main__':
    app.run(debug=True, port=5000)
