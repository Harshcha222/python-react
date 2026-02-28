import React, { useState } from 'react'

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    if (!form.name || !form.email || !form.password) {
      setMsg('All fields are required')
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/auth/signup', {
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
          setMsg('Member added successfully!')
          setForm({ name: '', email: '', password: '' })
        } else {
          setMsg('Error: ' + (payload.message || 'Failed to add member'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Add New Library Member</h2>
      <form onSubmit={submit} style={{ 
        border: '1px solid #ddd', 
        padding: 20, 
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Name *</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={onChange}
            placeholder="Full name"
            style={{ width: '100%', padding: 10, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Email *</label>
          <input 
            name="email" 
            type="email"
            value={form.email} 
            onChange={onChange}
            placeholder="email@example.com"
            style={{ width: '100%', padding: 10, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Password *</label>
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={onChange}
            placeholder="Set a password"
            style={{ width: '100%', padding: 10, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </form>
      {msg && (
        <p style={{ 
          marginTop: 16,
          padding: 12,
          backgroundColor: msg.includes('Error') ? '#ffebee' : '#e8f5e9',
          color: msg.includes('Error') ? '#c62828' : '#2e7d32',
          borderRadius: 4,
          borderLeft: `4px solid ${msg.includes('Error') ? '#c62828' : '#2e7d32'}`
        }}>
          {msg}
        </p>
      )}
    </div>
  )
}
