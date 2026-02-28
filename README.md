# 📚 Library Management System (Flask Backend)

A simple and robust Library Management Web Application built using **Python (Flask)**.
Designed for librarians to efficiently manage books, members, transactions, and book imports from the [Frappe Library API](https://frappe.io/api/method/frappe-library).

---

## 🚀 Features

### Core Functionality

* CRUD operations on Books and Members
* Issue books to members
* Return books with rent fee calculation
* Track transactions
* Search books by title or author
* Member debt check before issuing (limit ₹500)
* Import books from external API (Frappe.io)

---

## 🔐 Authentication

* JWT-based login system
* Role-based access control (`librarian` vs `member`)
* Only librarians can:

  * Add members
  * Manage books
  * View or delete members
  * Issue and return books

---

## ⚙️ Tech Stack

| Tool/Library       | Usage                         |
| ------------------ | ----------------------------- |
| Flask              | Web framework                 |
| SQLAlchemy         | ORM for DB models             |
| Flask-Migrate      | Database migrations           |
| Flask-JWT-Extended | JWT-based authentication      |
| Requests           | Calling external API (Frappe) |
|  MySQL     | Database                      |

---

## 📁 Folder Structure

```
models/
├── model.py           # User, Book, Transaction models
└── __init__.py        # DB & migrate setup

routes/
├── sign_up.py            # Login, member CRUD
├── books.py           # Book CRUD and search
├── transactions.py    # Issue/return + fee logic
└── import_books.py    # Import books from Frappe API

app.py                 # Main app entry, blueprint registration
.env                   # Environment variables
requirements.txt       # Python dependencies
README.md              # Project documentation
```

---

## 📦 API Endpoints

### 🔐 Auth & Members (`/auth`)

* **POST** `/auth/login`
* **POST** `/auth/signup` *(Librarian only – adds a member)*
* **GET** `/auth/members` *(Librarian only)*
* **PUT** `/auth/members/<member_id>` *(Librarian only)*
* **DELETE** `/auth/members/<member_id>` *(Librarian only)*

### 📚 Books (`/books`)

* **GET** `/books?title=Harry&author=Rowling`
* **POST** `/books` *(Librarian only)*
* **PUT** `/books/<book_id>` *(Librarian only)*
* **DELETE** `/books/<book_id>` *(Librarian only)*

### 🔁 Transactions (`/transactions`)

* **POST** `/transactions/issue` *(Librarian only)*
* **POST** `/transactions/return` *(Librarian only)*
* **GET** `/transactions` *(Librarian only)*

### 🌐 Import Books (`/import-books`)

* **POST** `/import-books`
  **Body example:**

  ```json
  {
    "count": 30,
    "title": "Harry Potter"
  }
  ```

---

## 💡 Fee Calculation

* Rent fee = `days_held * per_day_fee`
* Example: `5 days * ₹10 = ₹50`
* Member’s `debt` is updated by this fee
* If `debt > ₹500`, issuing books is blocked

---

## 🧪 Initial Librarian Creation (Flask Shell)

```python
from app import app
from models.model import User
from models.__init__ import db
from werkzeug.security import generate_password_hash

with app.app_context():
    librarian = User(
        name="Admin",
        email="librarian@example.com",
        role="librarian",
        password_hash=generate_password_hash("admin123")
    )
    db.session.add(librarian)
    db.session.commit()
```

---

## ⚙️ Setup Instructions

1. **Clone & Install**

   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   python -m venv venv
   venv\Scripts\activate  # or source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure `.env`**

   ```
   DATABASE_URL=mysql+pymysql://username:password@localhost/library_db
   JWT_SECRET_KEY=your_secret_key
   ```

3. **Database Migrations**

   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

4. **Run the App**

   ```bash
   python app.py
   ```

   The server will run at `http://127.0.0.1:5001`.

---

## 📝 Postman Examples

> Use `Authorization: Bearer <TOKEN>` for protected routes

1. **Login**

   ```
   POST /auth/login
   { "email": "librarian@example.com", "password": "admin123" }
   ```

2. **Add Member**

   ```
   POST /auth/signup
   { "name": "John Doe", "email": "john@example.com", "password": "123456" }
   ```

3. **Add Book**

   ```
   POST /books
   { "title":"Atomic Habits","author":"James Clear","isbn":"1234567890123",
     "publisher":"Penguin","pages":200,"stock":5,"per_day_fee":10 }
   ```

4. **Issue Book**

   ```
   POST /transactions/issue
   { "member_id":1, "book_id":1 }
   ```

5. **Return Book**

   ```
   POST /transactions/return
   { "transaction_id":1 }
   ```

6. **Import Books**

   ```
   POST /import-books
   { "count":10, "title":"Harry Potter" }
   ```

---




## 📋 License

This project is for evaluation purposes only.
