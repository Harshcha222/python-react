import React, { useState, useEffect } from 'react'

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  function loadMembers() {
    setLoading(true)
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/auth/members', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((payload) => setMembers(payload.data || []))
      .catch((err) => {
        console.error('Error fetching members:', err)
        setMembers([])
      })
      .finally(() => setLoading(false))
  }

  function startEdit(member) {
    setEditingId(member.id)
    setEditForm({ name: member.name, email: member.email })
    setMsg('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ name: '', email: '' })
    setMsg('')
  }

  function updateMember() {
    if (!editForm.name || !editForm.email) {
      setMsg('Name and email are required')
      return
    }

    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/auth/members/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editForm)
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success' || payload.message === 'Member updated successfully') {
          setMsg('Member updated successfully!')
          loadMembers()
          cancelEdit()
        } else {
          setMsg('Error: ' + (payload.message || 'Failed to update member'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
  }

  function deleteMember(memberId) {
    if (!window.confirm('Delete this member?')) return

    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/auth/members/${memberId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.status === 'success') {
          setMsg('Member deleted successfully!')
          loadMembers()
        } else {
          setMsg('Error: ' + (payload.message || 'Failed to delete member'))
        }
      })
      .catch((err) => setMsg('Error: ' + err.message))
  }

  if (loading) return <div>Loading members…</div>

  return (
    <div>
      <h2>Manage Members</h2>
      {msg && (
        <p style={{ 
          padding: 12, 
          backgroundColor: msg.includes('Error') ? '#ffebee' : '#e8f5e9',
          color: msg.includes('Error') ? '#c62828' : '#2e7d32',
          borderRadius: 4,
          marginBottom: 12
        }}>
          {msg}
        </p>
      )}

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>Debt (₹)</th>
              <th style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td style={{ border: '1px solid #ddd', padding: 12 }}>
                  {editingId === member.id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={{ width: '100%', padding: 6 }}
                    />
                  ) : (
                    member.name
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: 12 }}>
                  {editingId === member.id ? (
                    <input
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ width: '100%', padding: 6 }}
                    />
                  ) : (
                    member.email
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>
                  ₹{member.debt || 0}
                </td>
                <td style={{ border: '1px solid #ddd', padding: 12, textAlign: 'center' }}>
                  {editingId === member.id ? (
                    <>
                      <button
                        onClick={updateMember}
                        style={{
                          marginRight: 8,
                          padding: '6px 12px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ccc',
                          color: '#333',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(member)}
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
                        onClick={() => deleteMember(member.id)}
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
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
