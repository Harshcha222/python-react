import React, { useState } from 'react'

export default function UpdateBook({ book, onUpdated, onCancel }) {
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publisher: book.publisher,
    pages: book.pages,
    stock: book.stock,
    per_day_fee: book.per_day_fee
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    const { name, value } = e.target
    setForm({ 
      ...form, 
      [name]: name === 'pages' || name === 'stock' ? (value ? parseInt(value) : '') : value 
    })
  }

  function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/books/${book.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success') {
          setMsg('Book updated successfully!')
          setTimeout(() => {
            if (onUpdated) onUpdated()
          }, 1000)
        } else {
          setMsg('Error: ' + (payload.message || 'Failed to update book'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ 
      border: '1px solid #2196F3', 
      padding: 16, 
      borderRadius: 4, 
      marginBottom: 12,
      backgroundColor: '#f0f8ff'
    }}>
      <h4>Edit Book</h4>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Author</label>
            <input
              name="author"
              value={form.author}
              onChange={onChange}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>ISBN</label>
            <input
              name="isbn"
              value={form.isbn}
              onChange={onChange}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Publisher</label>
            <input
              name="publisher"
              value={form.publisher}
              onChange={onChange}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Pages</label>
            <input
              name="pages"
              type="number"
              value={form.pages}
              onChange={onChange}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={onChange}
              min="0"
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Fee per Day (₹)</label>
            <input
              name="per_day_fee"
              type="number"
              value={form.per_day_fee}
              onChange={onChange}
              step="0.1"
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
      {msg && (
        <p style={{ marginTop: 12, color: msg.includes('Error') ? 'red' : 'green' }}>
          {msg}
        </p>
      )}
    </div>
  )
}
