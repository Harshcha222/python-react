import React, { useState, useEffect } from 'react'

export default function ReturnBook({ onTransactionUpdated }) {
  const [transactions, setTransactions] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  function loadTransactions() {
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/transactions/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((payload) => {
        // Filter for unreturned transactions
        const unreturned = (payload.data || []).filter((t) => !t.returned)
        setTransactions(unreturned)
      })
      .catch((err) => console.error('Error fetching transactions:', err))
  }

  function returnBook(transactionId) {
    setMsg('')
    setLoading(true)

    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/transactions/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ transaction_id: transactionId })
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success') {
          setMsg(`Book returned! Fee: ₹${payload.data.fee}`)
          loadTransactions()
          if (onTransactionUpdated) onTransactionUpdated()
        } else {
          setMsg('Error: ' + (payload.message || 'Failed to return book'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 4, marginBottom: 20 }}>
      <h3>Return Book</h3>
      {transactions.length === 0 ? (
        <p>No outstanding transactions.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Member</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Book</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Issued Date</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{t.user_name}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{t.book_title}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  {new Date(t.issue_date).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                  <button
                    onClick={() => returnBook(t.id)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Processing...' : 'Return'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {msg && (
        <p style={{ marginTop: 12, color: msg.includes('Error') ? 'red' : 'green' }}>
          {msg}
        </p>
      )}
    </div>
  )
}
