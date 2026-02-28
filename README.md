# 📚 Library Management System

A complete Library Management Web Application with **Python (Flask) backend** and **React (Vite) frontend**.
Designed for librarians to efficiently manage books, members, transactions, and fees.
Features role-based access control with separate UIs for librarians and library members.

---

## 🚀 Features

### Core Functionality

* CRUD operations on Books and Members
* Issue books to members
* Return books with rent fee calculation
* Track transactions
* Search books by title or author
* Member debt check before issuing (limit ₹500)

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

## 🎨 Frontend UI & Features

### User Roles & Interfaces

**Librarian View:**
* Full Books catalog with Edit/Delete options
* Add new books to library
* Manage library members (Add/Edit/Delete)
* Issue books to members
* Process book returns and calculate fees
* View complete transaction history
* Track member debt

**Member View:**
* Browse available books (stock > 0)
* View book details (title, author, stock, fee)
* Limited to read-only access
* Cannot see member management features

### Frontend Security
* JWT token stored in localStorage
* Role extracted from JWT payload during login
* Role-based UI rendering (conditional tabs & buttons)
* All API requests include Authorization header with Bearer token
* Frontend mirrors backend permission checks

---

## ⚙️ Tech Stack

### Backend
| Tool/Library       | Usage                         |
| ------------------ | ----------------------------- |
| Flask              | Web framework                 |
| SQLAlchemy         | ORM for DB models             |
| Flask-Migrate      | Database migrations           |
| Flask-JWT-Extended | JWT-based authentication      |
| Flask-CORS         | Cross-origin resource sharing |
| MySQL              | Database                      |

### Frontend
| Tool/Library       | Usage                         |
| ------------------ | ----------------------------- |
| React 18.2         | UI framework                  |
| Vite 5.4          | Build tool & dev server       |
| JavaScript (JSX)   | Component logic               |
| CSS                | Styling                       |
| Fetch API          | HTTP requests to backend      |
| JWT (localStorage) | Client-side token management  |

---

## 📁 Folder Structure

### Backend
```
models/
├── model.py           # User, Book, Transaction models
└── __init__.py        # DB & migrate setup

routes/
├── sign_up.py         # Login, member CRUD
├── books.py           # Book CRUD and search
└── transactions.py    # Issue/return + fee logic

migrations/           # Database migration files
app.py                # Main Flask app entry point
config.py             # Configuration settings
requirements.txt      # Python dependencies
```

### Frontend
```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Authentication with JWT role extraction
│   │   ├── Books.jsx              # Books catalog (role-filtered view)
│   │   ├── AddBook.jsx            # Add new book (librarian only)
│   │   ├── UpdateBook.jsx         # Edit book details (librarian only)
│   │   ├── Members.jsx            # Member management (librarian only)
│   │   ├── SignUp.jsx             # Add new member (librarian only)
│   │   ├── Transactions.jsx       # Issue/return books & history
│   │   ├── IssueBook.jsx          # Book issue form (librarian only)
│   │   └── ReturnBook.jsx         # Book return form (librarian only)
│   ├── App.jsx                    # Main app shell with navigation
│   ├── main.jsx                   # React initialization
│   └── styles.css                 # Global styling
├── index.html         # HTML entry point
├── package.json       # Frontend dependencies
└── vite.config.js     # Vite configuration
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

---

## 🔗 Frontend-Backend Integration

### API Communication
- **Base URL**: `http://localhost:5000`
- **Headers**: All requests include `Authorization: Bearer <JWT_TOKEN>`
- **Response Format**: `{ "status": "success/error", "message": "...", "data": {...} }`

### Request Examples (from Frontend)

**Login:**
```javascript
fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

**Get Books:**
```javascript
fetch('http://localhost:5000/books/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

**Issue Book:**
```javascript
fetch('http://localhost:5000/transactions/issue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ member_id, book_id })
})
```

### Token Management
- JWT token stored in `localStorage.token` after successful login
- Role extracted from JWT payload: `localStorage.userRole`
- Role determines UI visibility:
  - `role === 'librarian'`: Full UI with management features
  - `role === 'member'`: Limited UI with read-only access
- Token automatically included in all authenticated requests

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

### Backend Setup

1. **Clone & Install Python Dependencies**

   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   python -m venv venv
   venv\Scripts\activate  # Windows: or source venv/bin/activate (Mac/Linux)
   pip install -r requirements.txt
   ```

2. **Configure `.env`**

   Create a `.env` file in the root directory:
   ```
   DATABASE_URL=mysql+pymysql://username:password@localhost/library_db
   JWT_SECRET_KEY=your_secret_key_here
   ```

3. **Database Migrations**

   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

4. **Create Initial Librarian**

   ```bash
   python create_librarian.py
   # Or manually via Flask shell:
   flask shell
   ```
   
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

5. **Run Backend Server**

   ```bash
   python app.py
   ```
   
   Backend will run at `http://localhost:5000`

### Frontend Setup

1. **Install Node.js & npm** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version && npm --version`

2. **Install Frontend Dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Run Frontend Development Server**

   ```bash
   npm run dev
   ```
   
   Frontend will run at `http://localhost:5173`
   - Browser will auto-open, or manually visit the URL
   - Hot module reloading enabled for live edits

### Running Both Simultaneously

1. **Terminal 1 - Backend**
   ```bash
   python app.py
   ```

2. **Terminal 2 - Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Open `http://localhost:5173` in your browser
   - Login with test credentials:
     - **Librarian**: `librarian@example.com` / `admin123`
     - Create members as needed via signup endpoint or UI

---

## 📝 Using the Application

### Via React Frontend (Recommended)

1. **Login Page**
   - Enter email and password for librarian or member account
   - JWT token automatically extracted and stored
   - Role-based UI renders based on token claims

2. **Librarian Dashboard**
   - **Books Tab**: View all books, add new, edit, delete
   - **Add Member Tab**: Create new library members
   - **Members Tab**: View, edit, delete members with debt tracking
   - **Transactions Tab**: Issue books, process returns, view history

3. **Member Dashboard**
   - **Books Tab**: Browse available books (stock > 0)
   - Can see book details but cannot manage library

### Via API (Postman/curl)

> Use `Authorization: Bearer <TOKEN>` header for protected routes

1. **Login**
   ```
   POST http://localhost:5000/auth/login
   Body: { "email": "librarian@example.com", "password": "admin123" }
   Response: { "status": "success", "data": { "access_token": "..." } }
   ```

2. **Add Member** (Librarian only)
   ```
   POST http://localhost:5000/auth/signup
   Headers: Authorization: Bearer <TOKEN>
   Body: { "name": "John Doe", "email": "john@example.com", "password": "123456" }
   ```

3. **Get Books**
   ```
   GET http://localhost:5000/books/
   Query: ?title=Harry&author=Rowling
   ```

4. **Add Book** (Librarian only)
   ```
   POST http://localhost:5000/books
   Headers: Authorization: Bearer <TOKEN>
   Body: {
     "title":"Atomic Habits",
     "author":"James Clear",
     "isbn":"1234567890123",
     "publisher":"Penguin",
     "pages":200,
     "stock":5,
     "per_day_fee":10
   }
   ```

5. **Issue Book** (Librarian only)
   ```
   POST http://localhost:5000/transactions/issue
   Headers: Authorization: Bearer <TOKEN>
   Body: { "member_id": 1, "book_id": 1 }
   ```

6. **Return Book** (Librarian only)
   ```
   POST http://localhost:5000/transactions/return
   Headers: Authorization: Bearer <TOKEN>
   Body: { "transaction_id": 1 }
   ```

---

## 📋 Project Highlights

✅ **Full-Stack Application**: Complete backend + frontend implementation
✅ **Role-Based Access Control**: Different UIs for librarians and members
✅ **JWT Authentication**: Secure token-based authentication with localStorage
✅ **Responsive UI**: Clean, intuitive interface built with React
✅ **CRUD Operations**: Complete management of books and members
✅ **Transaction Tracking**: Issue/return books with fee calculation
✅ **Debt Management**: Track member debt with ₹500 limit

## 🛠️ Development Workflow

### Making Frontend Changes
```bash
cd frontend
npm run dev  # Frontend rebuilds on file save
```

### Making Backend Changes
```bash
# Backend auto-reloads with debug=True
python app.py
```

### Building for Production
```bash
cd frontend
npm run build  # Creates dist/ folder for deployment
```

---

## 📋 License

This project is for evaluation purposes only.
---

## 📹 Walkthrough Video Script (Sample)

Below is a suggested script for your 10–15 minute walkthrough video. You can adapt and expand as needed:

---

### 1. Introduction
Hi, I’m [Your Name], and this is my Library Management System built with Flask (backend), React (frontend), and MySQL (database).

### 2. What the Product Does
This app lets librarians and members manage books, issue/return transactions, and track member debts. Librarians have full control; members can browse and borrow books.

### 3. Architecture Overview
- **Frontend:** React (Vite) SPA, role-based UI, communicates with backend via REST API
- **Backend:** Flask API, JWT authentication, SQLAlchemy ORM, CORS enabled
- **Database:** MySQL (can swap for SQLite/PostgreSQL)
- **Integration:** Frontend fetches data from Flask API, which interacts with the database

### 4. Code Structure
- **Backend:**
   - `app.py`: App entry, blueprint registration
   - `models/`: User, Book, Transaction models
   - `routes/`: Auth, books, transactions endpoints
   - `migrations/`: DB migration scripts
- **Frontend:**
   - `src/components/`: Login, Books, Members, Transactions, etc.
   - `App.jsx`: Main shell, navigation, role-based rendering
   - `main.jsx`: React entry point

### 5. Key Technical Decisions
- **Flask:** Lightweight, easy REST API, JWT support
- **React:** Fast SPA, easy state management with hooks
- **JWT:** Secure, stateless authentication, role claims
- **SQLAlchemy:** ORM for DB flexibility
- **Vite:** Fast dev/build for React
- **State Management:** React hooks, localStorage for token/role

### 6. How I Used AI
- Used GitHub Copilot for code suggestions, boilerplate, and refactoring
- AI helped speed up CRUD logic, error handling, and React component scaffolding

### 7. Risks & Tradeoffs
- **Security:** JWT in localStorage (simple, but XSS risk)
- **DB Choice:** MySQL for robustness, but SQLite/PostgreSQL possible
- **Frontend:** SPA is fast, but needs careful API error handling
- **Role Logic:** All sensitive actions double-checked on backend

### 8. How to Extend
- Add book reservation/waitlist
- Add email notifications
- Add admin dashboard analytics
- Add search/filter improvements
- Add Docker for easier deployment
- Add unit/integration tests

### 9. Demo
- Show login as librarian, add/edit/delete books
- Show member view, borrow/return books
- Show transaction history and debt tracking
- Show code for key endpoints/components

### 10. Closing
Thanks for watching! All setup instructions are in the README. Let me know if you have questions.
