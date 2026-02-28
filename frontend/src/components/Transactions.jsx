import React, { useEffect, useState } from 'react'
import IssueBook from './IssueBook'
import ReturnBook from './ReturnBook'

export default function Transactions() {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  function loadTransactions() {
    setLoading(true)
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/transactions/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then((payload) => setTxs(payload.data || []))
      .catch((err) => {
        console.error('Error fetching transactions:', err)
        setTxs([])
      })
      .finally(() => setLoading(false))
  }

  if (loading) return <div>Loading transactions…</div>

  return (
    <div>
      <h2>Transactions</h2>
      
      <IssueBook onTransactionCreated={loadTransactions} />
      <ReturnBook onTransactionUpdated={loadTransactions} />

      <h3 style={{ marginTop: 24 }}>All Transactions</h3>
      {txs.length === 0 ? (
        <div>No transactions found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Member</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Book</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Issued</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Returned</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Fee</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{t.user_name}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{t.book_title}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{new Date(t.issue_date).toLocaleDateString()}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  {t.return_date ? new Date(t.return_date).toLocaleDateString() : '-'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: t.returned ? '#4CAF50' : '#FFC107',
                    color: t.returned ? 'white' : 'black',
                    fontSize: 12
                  }}>
                    {t.returned ? 'Returned' : 'Outstanding'}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>₹{t.fee || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
