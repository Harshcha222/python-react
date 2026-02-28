import React, { useState } from 'react'

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success' && payload.data && payload.data.access_token) {
          localStorage.setItem('token', payload.data.access_token)
          // Decode JWT to get role
          try {
            const parts = payload.data.access_token.split('.')
            if (parts.length !== 3) throw new Error('Invalid token format')
            
            const base64Url = parts[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = JSON.parse(atob(base64))
            
            console.log('JWT Decoded:', jsonPayload)
            const role = jsonPayload.role || 'member'
            localStorage.setItem('userRole', role)
            console.log('Stored role:', role)
          } catch (err) {
            console.error('Failed to decode JWT:', err)
            localStorage.setItem('userRole', 'member')
          }
          setMsg('Login successful!')
          setTimeout(() => onLoginSuccess(), 1000)
        } else {
          setMsg('Error: ' + (payload.message || 'Login failed'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h1>Library Login</h1>
      <p style={{ fontSize: 12, color: '#666' }}>
        Demo: Use the librarian email/password from create_librarian.py
      </p>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <br />
          <input 
            name="email" 
            value={form.email} 
            onChange={onChange}
            placeholder="librarian@example.com"
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <br />
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={onChange}
            placeholder="password"
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {msg && <p style={{ marginTop: 12, color: msg.includes('Error') ? 'red' : 'green' }}>{msg}</p>}
    </div>
  )
}
