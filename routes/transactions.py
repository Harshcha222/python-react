from flask import Blueprint, request, jsonify
from models import db
from models.model import Book, User, Transaction 
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt

transactions_bp = Blueprint('transactions', __name__)


def error_response(msg, code=400):
    return jsonify({
        "status": "error",
        "message": msg,
        "data": {}
    }), code


@transactions_bp.route('/issue', methods=['POST'])
@jwt_required()
def issue_book():
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can issue books", 403)

    data = request.get_json()
    member_id = data.get('member_id')
    book_id = data.get('book_id')

    if not member_id or not book_id:
        return error_response("Both 'member_id' and 'book_id' are required", 422)

    member = User.query.filter_by(id=member_id, role='member').first()
    book = Book.query.get(book_id)

    if not member or not book:
        return error_response('Member or Book not found', 404)
    if book.stock < 1:
        return error_response('Book out of stock', 400)
    if member.debt > 500:
        return error_response('Member debt exceeds ₹500', 400)

    txn = Transaction(user_id=member.id, book_id=book.id)
    book.stock -= 1
    db.session.add(txn)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return error_response("Failed to issue book. Please try again.", 500)

    return jsonify({
        'status': 'success',
        'message': 'Book issued successfully',
        'data': {'transaction_id': txn.id}
    }), 200


@transactions_bp.route('/return', methods=['POST'])
@jwt_required()
def return_book():
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can process returns", 403)

    data = request.get_json()
    transaction_id = data.get('transaction_id')

    if not transaction_id:
        return error_response("'transaction_id' is required", 422)

    txn = Transaction.query.get(transaction_id)
    if not txn or txn.returned:
        return error_response('Invalid or already returned transaction', 404)

    txn.returned = True
    txn.return_date = datetime.utcnow()

    # Calculate fee
    days_held = max((txn.return_date - txn.issue_date).days, 1)
    per_day_fee = txn.book.per_day_fee or 10
    fee = days_held * per_day_fee

    txn.fee = fee
    txn.book.stock += 1
    txn.user.debt += fee

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return error_response("Failed to return book. Please try again.", 500)

    return jsonify({
        'status': 'success',
        'message': 'Book returned successfully',
        'data': {
            'transaction_id': txn.id,
            'days_held': days_held,
            'fee': fee
        }
    }), 200


@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can view transactions", 403)

    transactions = Transaction.query.order_by(Transaction.issue_date.desc()).all()
    data = [{
        'id': t.id,
        'user_id': t.user_id,
        'user_name': t.user.name,
        'book_id': t.book_id,
        'book_title': t.book.title,
        'issue_date': t.issue_date.isoformat(),
        'return_date': t.return_date.isoformat() if t.return_date else None,
        'returned': t.returned,
        'fee': t.fee
    } for t in transactions]

    return jsonify({
        'status': 'success',
        'message': 'Transactions fetched successfully',
        'data': data
    }), 200
