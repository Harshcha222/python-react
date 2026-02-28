import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Books from './components/Books'
import SignUp from './components/SignUp'
import Members from './components/Members'
import Transactions from './components/Transactions'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('member')
  const [view, setView] = useState('books')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('userRole')
    if (token) {
      setIsLoggedIn(true)
      setUserRole(role || 'member')
    }
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setIsLoggedIn(false)
    setUserRole('member')
    setView('books')
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      {/* Debug info */}
      <div style={{ 
        position: 'fixed', 
        bottom: 10, 
        right: 10, 
        backgroundColor: '#333', 
        color: '#fff', 
        padding: 8, 
        borderRadius: 4,
        fontSize: 12,
        zIndex: 9999
      }}>
        Role: <strong>{userRole}</strong>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>📚 Library Management {userRole === 'librarian' ? '(Librarian)' : '(Member)'}</h1>
        <button 
          onClick={logout} 
          style={{ 
            padding: '10px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          Logout
        </button>
      </div>
      <nav style={{ marginBottom: 24, borderBottom: '2px solid #ddd', paddingBottom: 12 }}>
        {['books', ...(userRole === 'librarian' ? ['signup', 'members', 'transactions'] : [])].map((tab) => (
          <button 
            key={tab}
            onClick={() => setView(tab)}
            style={{
              marginRight: 12,
              padding: '10px 16px',
              backgroundColor: view === tab ? '#2196F3' : '#f5f5f5',
              color: view === tab ? 'white' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: view === tab ? 'bold' : 'normal',
              fontSize: 14
            }}
          >
            {tab === 'books' ? '📖 Books' : tab === 'signup' ? '➕ Add Member' : tab === 'members' ? '👥 Members' : '📋 Transactions'}
          </button>
        ))}
      </nav>

      {userRole !== 'librarian' && (
        <div style={{
          padding: 12,
          backgroundColor: '#fff3e0',
          borderLeft: '4px solid #ff9800',
          marginBottom: 20,
          borderRadius: 4
        }}>
          📌 <strong>Member View:</strong> You can only view books. To manage members and transactions, login as a librarian.
        </div>
      )}

      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        {view === 'books' && <Books />}
        {view === 'signup' && userRole === 'librarian' && <SignUp />}
        {view === 'members' && userRole === 'librarian' && <Members />}
        {view === 'transactions' && userRole === 'librarian' && <Transactions />}
      </main>
    </div>
  )
}
