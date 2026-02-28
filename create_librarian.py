from app import app
from models import db
from models.model import User

def create_librarian():
    with app.app_context():
        email = "librarian@example.com"

        # Check if librarian already exists
        existing = User.query.filter_by(email=email).first()
        if existing:
            print("❌ Librarian already exists")
            return

        librarian = User(
            name="Main Librarian",
            email=email,
            role="librarian"
        )
        librarian.set_password("admin123")

        db.session.add(librarian)
        db.session.commit()

        print("✅ Librarian created successfully")
        print("📧 Email:", email)
        print("🔑 Password: admin123")

if __name__ == "__main__":
    create_librarian()