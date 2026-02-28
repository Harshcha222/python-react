from datetime import datetime
from . import db 
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "user" 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('librarian', 'member'), nullable=False)
    debt = db.Column(db.Float, default=0.0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Book(db.Model):
    __tablename__ = "book"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    isbn = db.Column(db.String(13), unique=True)
    publisher = db.Column(db.String(255))
    pages = db.Column(db.Integer)
    stock = db.Column(db.Integer, default=1)
    per_day_fee = db.Column(db.Float, default=10.0)

class Transaction(db.Model):
    __tablename__ = "transaction"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    return_date = db.Column(db.DateTime)
    returned = db.Column(db.Boolean, default=False)
    fee = db.Column(db.Float, default=0.0)

    user = db.relationship('User', backref='transactions')
    book = db.relationship('Book', backref='transactions')
