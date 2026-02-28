import React, { useState, useEffect } from 'react'

export default function IssueBook({ onTransactionCreated }) {
  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])
  const [form, setForm] = useState({ member_id: '', book_id: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    // Fetch members
    fetch('http://localhost:5000/auth/members', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((payload) => setMembers(payload.data || []))
      .catch((err) => console.error('Error fetching members:', err))

    // Fetch books
    fetch('http://localhost:5000/books/')
      .then((r) => r.json())
      .then((payload) => setBooks(payload.data || []))
      .catch((err) => console.error('Error fetching books:', err))
  }, [])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    if (!form.member_id || !form.book_id) {
      setMsg('Please select both member and book')
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/transactions/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        member_id: parseInt(form.member_id),
        book_id: parseInt(form.book_id)
      })
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success') {
          setMsg('Book issued successfully!')
          setForm({ member_id: '', book_id: '' })
          if (onTransactionCreated) onTransactionCreated()
        } else {
          setMsg('Error: ' + (payload.message || 'Failed to issue book'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 4, marginBottom: 20 }}>
      <h3>Issue Book to Member</h3>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
        <div>
          <label>Select Member</label>
          <select
            name="member_id"
            value={form.member_id}
            onChange={onChange}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          >
            <option value="">-- Select Member --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select Book</label>
          <select
            name="book_id"
            value={form.book_id}
            onChange={onChange}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          >
            <option value="">-- Select Book --</option>
            {books.filter((b) => b.stock > 0).map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} by {b.author} (Stock: {b.stock})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Issuing...' : 'Issue'}
        </button>
      </form>
      {msg && (
        <p style={{ marginTop: 12, color: msg.includes('Error') ? 'red' : 'green' }}>
          {msg}
        </p>
      )}
    </div>
  )
}
