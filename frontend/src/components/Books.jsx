import React, { useEffect, useState } from 'react'
import AddBook from './AddBook'
import UpdateBook from './UpdateBook'

export default function Books() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingBookId, setEditingBookId] = useState(null)
  const userRole = localStorage.getItem('userRole') || 'member'

  useEffect(() => {
    loadBooks()
  }, [])

  function loadBooks() {
    setLoading(true)
    fetch('http://localhost:5000/books/')
      .then((r) => r.json())
      .then((payload) => setBooks(payload.data || []))
      .catch((err) => {
        console.error('Error fetching books:', err)
        setBooks([])
      })
      .finally(() => setLoading(false))
  }

  function deleteBook(bookId) {
    if (!window.confirm('Are you sure you want to delete this book?')) return

    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/books/${bookId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success') {
          loadBooks()
        } else {
          alert('Error: ' + (payload.message || 'Failed to delete book'))
        }
      })
      .catch((err) => alert('Error: ' + err.message))
  }

  if (loading) return <div>Loading books…</div>

  const editingBook = books.find((b) => b.id === editingBookId)
  
  // Filter books based on user role
  const displayBooks = userRole === 'librarian' ? books : books.filter((b) => b.stock > 0)

  return (
    <div>
      <h2>📖 Books</h2>
      {userRole === 'librarian' && (
        <AddBook onBookAdded={loadBooks} />
      )}

      {userRole === 'librarian' && editingBook && (
        <UpdateBook
          book={editingBook}
          onUpdated={() => {
            setEditingBookId(null)
            loadBooks()
          }}
          onCancel={() => setEditingBookId(null)}
        />
      )}

      {userRole === 'member' && (
        <div style={{
          padding: 12,
          backgroundColor: '#e3f2fd',
          borderLeft: '4px solid #2196F3',
          marginBottom: 16,
          borderRadius: 4
        }}>
          ℹ️ These are available books in stock. Contact your librarian to borrow any book.
        </div>
      )}
      
      {displayBooks.length === 0 ? (
        <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>
          {userRole === 'member' ? '📭 No books available right now' : '📭 No books found. Add some books to get started!'}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'left' }}>Title</th>
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'left' }}>Author</th>
              {userRole === 'librarian' && (
                <>
                  <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'left' }}>ISBN</th>
                  <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'left' }}>Publisher</th>
                  <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>Pages</th>
                </>
              )}
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>Stock</th>
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>Fee/Day</th>
              {userRole === 'librarian' && (
                <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayBooks.map((b) => (
              <tr key={b.id}>
                <td style={{ border: '1px solid #ddd', padding: 12 }}>
                  <strong>{b.title}</strong>
                </td>
                <td style={{ border: '1px solid #ddd', padding: 12 }}>{b.author}</td>
                {userRole === 'librarian' && (
                  <>
                    <td style={{ border: '1px solid #ddd', padding: 12 }}>{b.isbn || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: 12 }}>{b.publisher || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>{b.pages || '-'}</td>
                  </>
                )}
                <td style={{ 
                  border: '1px solid #ddd', 
                  padding: 12, 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: b.stock > 0 ? '#4CAF50' : '#f44336'
                }}>
                  {b.stock}
                </td>
                <td style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>₹{b.per_day_fee}</td>
                {userRole === 'librarian' && (
                  <td style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>
                    <button
                      onClick={() => setEditingBookId(b.id)}
                      style={{
                        marginRight: 8,
                        padding: '6px 12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBook(b.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
