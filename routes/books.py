from flask import Blueprint, request, jsonify
from models import db
from models.model import Book
from flask_jwt_extended import jwt_required, get_jwt

books_bp = Blueprint('books', __name__)

def error_response(message, code=400):
    return jsonify({
        "status": "error",
        "message": message,
        "data": {}
    }), code


@books_bp.route('/', methods=['GET'])
def get_books():
    title = request.args.get('title')
    author = request.args.get('author')

    query = Book.query
    if title:
        query = query.filter(Book.title.ilike(f'%{title}%'))
    if author:
        query = query.filter(Book.author.ilike(f'%{author}%'))

    books = query.all()
    data = [{
        'id': b.id,
        'title': b.title,
        'author': b.author,
        'isbn': b.isbn,
        'publisher': b.publisher,
        'pages': b.pages,
        'stock': b.stock,
        'per_day_fee': b.per_day_fee
    } for b in books]

    return jsonify({
        'status': 'success',
        'message': 'Books fetched successfully',
        'data': data
    }), 200


@books_bp.route('/', methods=['POST'])
@jwt_required()
def add_book():
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can add books", 403)

    data = request.get_json()
    required_fields = ['title', 'author']
    for field in required_fields:
        if not data.get(field):
            return error_response(f"'{field}' is required", 422)

    book = Book(
        title=data.get('title'),
        author=data.get('author'),
        isbn=data.get('isbn'),
        publisher=data.get('publisher'),
        pages=data.get('pages'),
        stock=data.get('stock', 1),
        per_day_fee=data.get('per_day_fee', 10.0)
    )

    db.session.add(book)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return error_response("Failed to add book. Please try again.", 500)

    return jsonify({
        'status': 'success',
        'message': 'Book added successfully',
        'data': {'id': book.id}
    }), 201

@books_bp.route('/<int:book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can update books", 403)

    book = Book.query.get(book_id)
    if not book:
        return error_response("Book not found", 404)

    data = request.get_json()
    book.title = data.get('title', book.title)
    book.author = data.get('author', book.author)
    book.isbn = data.get('isbn', book.isbn)
    book.publisher = data.get('publisher', book.publisher)
    book.pages = data.get('pages', book.pages)
    book.stock = data.get('stock', book.stock)
    book.per_day_fee = data.get('per_day_fee', book.per_day_fee)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return error_response("Failed to update book. Please try again.", 500)

    return jsonify({
        'status': 'success',
        'message': 'Book updated successfully',
        'data': {'id': book.id}
    }), 200


@books_bp.route('/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can delete books", 403)

    book = Book.query.get(book_id)
    if not book:
        return error_response("Book not found", 404)

    db.session.delete(book)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return error_response("Failed to delete book. Please try again.", 500)

    return jsonify({
        'status': 'success',
        'message': 'Book deleted successfully',
        'data': {'id': book_id}
    }), 200
