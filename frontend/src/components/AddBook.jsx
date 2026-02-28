import React, { useState } from 'react'

export default function AddBook({ onBookAdded }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    pages: '',
    stock: 1,
    per_day_fee: 10.0
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'pages' || name === 'stock' ? parseInt(value) || '' : value })
  }

  function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    if (!form.title || !form.author) {
      setMsg('Title and Author are required')
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/books/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success') {
          setMsg('Book added successfully!')
          setForm({
            title: '',
            author: '',
            isbn: '',
            publisher: '',
            pages: '',
            stock: 1,
            per_day_fee: 10.0
          })
          if (onBookAdded) onBookAdded()
        } else {
          setMsg('Error: ' + (payload.message || 'Failed to add book'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 4, marginBottom: 20 }}>
      <h3>Add New Book</h3>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Book title"
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Author *</label>
            <input
              name="author"
              value={form.author}
              onChange={onChange}
              placeholder="Author name"
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>ISBN</label>
            <input
              name="isbn"
              value={form.isbn}
              onChange={onChange}
              placeholder="ISBN"
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label>Publisher</label>
            <input
              name="publisher"
              value={form.publisher}
              onChange={onChange}
              placeholder="Publisher"
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
              placeholder="Number of pages"
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
              min="1"
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
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Book'}
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
