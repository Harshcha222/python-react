from flask import Blueprint, request, jsonify
from models import db
from models.model import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt 
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

def error_response(message, code=400):
    return jsonify({
        "status": "error",
        "message": message,
        "data": {}
    }), code

@auth_bp.route('/signup', methods=['POST'])
@jwt_required()
def signup_add_member():
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can add members", 403)

    data = request.get_json()
    required = ['name', 'email', 'password']
    for field in required:
        if not data.get(field):
            return error_response(f"'{field}' is required", 422)

    if User.query.filter_by(email=data['email']).first():
        return error_response("User already exists with this email", 409)

    user = User(
        name=data['name'],
        email=data['email'],
        role='member'
    )
    user.set_password(data['password'])

    db.session.add(user)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(str(e)) 
        return error_response("Database error", 500)

    return jsonify({
        "status": "success",
        "message": "Member added successfully",
        "data": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 201



@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return error_response("Email and password are required", 422)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password", 401)

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "email": user.email,
            "role": user.role
        },
        expires_delta=timedelta(hours=24)
    )

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "data": {
            "access_token": access_token
        }
    }), 200


@auth_bp.route('/members/<int:member_id>', methods=['PUT'])
@jwt_required()
def update_member(member_id):
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can update members", 403)

    member = User.query.filter_by(id=member_id, role='member').first()
    if not member:
        return error_response("Member not found", 404)

    data = request.get_json()
    member.name = data.get('name', member.name)
    member.email = data.get('email', member.email)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response("Database error", 500)

    return jsonify({'message': 'Member updated successfully'}), 200

@auth_bp.route('/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def delete_member(member_id):
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can delete members", 403)

    member = User.query.filter_by(id=member_id, role='member').first()
    if not member:
        return error_response("Member not found", 404)

    db.session.delete(member)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response("Database error", 500)

    return jsonify({
        "status": "success",
        "message": "Member deleted successfully",
        "data": {
            "id": member.id
        }
    }), 200


@auth_bp.route('/members', methods=['GET'])
@jwt_required()
def list_members():
    claims = get_jwt()
    if claims.get("role") != "librarian":
        return error_response("Only librarians can view members", 403)

    members = User.query.filter_by(role='member').all()
    members_data = [{
        "id": member.id,
        "name": member.name,
        "email": member.email,
        "debt": member.debt
    } for member in members]

    return jsonify({
        "status": "success",
        "message": "Members retrieved successfully",
        "data": members_data
    }), 200