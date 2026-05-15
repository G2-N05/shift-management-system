import { useState, useEffect } from 'react';

function HealthManagement() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDecl, setSelectedDecl] = useState(null);
  const [suggestedPoints, setSuggestedPoints] = useState(null);
  const [pointsDeducted, setPointsDeducted] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/health/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setDeclarations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decl) => {
    setSelectedDecl(decl);
    setSuggestedPoints(null);
    setPointsDeducted(0);
    setAdminNotes('');

    // Fetch AI suggestion
    try {
      const res = await fetch(`http://localhost:8080/api/health/ai-suggest?condition=${encodeURIComponent(decl.Condition)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setSuggestedPoints(data.SuggestedPoints);
      setPointsDeducted(data.SuggestedPoints);
    } catch (err) {
      console.error("AI suggestion failed", err);
    }
  };

  const handleApprove = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/health/${selectedDecl.ID}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          PointsDeducted: parseInt(pointsDeducted),
          AdminNotes: adminNotes
        })
      });
      if (res.ok) {
        alert('Declaration approved!');
        setSelectedDecl(null);
        fetchDeclarations();
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/health/${selectedDecl.ID}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          AdminNotes: adminNotes
        })
      });
      if (res.ok) {
        alert('Declaration rejected!');
        setSelectedDecl(null);
        fetchDeclarations();
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reject');
    }
  };

  if (loading) return <div className="text-center p-5">Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">Health & Energy Management</h4>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h6 className="m-0 fw-bold">Pending Declarations</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Employee</th>
                  <th>Condition</th>
                  <th>Proof File</th>
                  <th>Date</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {declarations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No pending health declarations</td>
                  </tr>
                ) : (
                  declarations.map(decl => (
                    <tr key={decl.ID}>
                      <td className="px-4 fw-medium">{decl.User?.Name || `User #${decl.UserID}`}</td>
                      <td>{decl.Condition}</td>
                      <td>
                        {decl.ProofFile ? (
                          <span className="badge bg-info text-dark">
                            <i className="bi bi-paperclip me-1"></i> Attached
                          </span>
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>
                      <td>{new Date(decl.CreatedAt).toLocaleDateString()}</td>
                      <td className="text-end px-4">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleReview(decl)}
                          data-bs-toggle="modal"
                          data-bs-target="#reviewModal"
                        >
                          Review & Score
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedDecl && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Health Declaration</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedDecl(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Employee:</strong> {selectedDecl.User?.Name || selectedDecl.UserID}
                </div>
                <div className="mb-3">
                  <strong>Current Energy Score:</strong> {selectedDecl.User?.EnergyScore}/100
                  {selectedDecl.User?.EnergyScore < 50 && (
                    <span className="badge bg-danger ms-2">Low Energy Risk</span>
                  )}
                </div>
                <div className="mb-3">
                  <strong>Condition:</strong>
                  <div className="p-2 bg-light rounded mt-1 border">
                    {selectedDecl.Condition}
                  </div>
                </div>
                
                {selectedDecl.ProofFile && (
                  <div className="mb-4">
                    <strong>Proof File Attached</strong>
                    <div className="small text-muted mt-1">{selectedDecl.ProofFile}</div>
                  </div>
                )}

                <hr/>
                <h6 className="fw-bold mb-3 text-primary">Energy Adjustment</h6>
                
                {suggestedPoints !== null ? (
                  <div className="alert alert-info py-2">
                    <i className="bi bi-robot me-2"></i>
                    AI Suggestion: Deduct <strong>{suggestedPoints}</strong> points
                  </div>
                ) : (
                  <div className="text-muted small mb-3">Fetching AI suggestion...</div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-bold">Points to Deduct</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={pointsDeducted} 
                    onChange={e => setPointsDeducted(e.target.value)}
                    min="0"
                    max="100"
                  />
                  <div className="form-text text-danger">
                    Note: If user energy is currently &lt; 50, backend rules will auto-clamp this to a maximum of 10 points regardless of input.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Admin Notes</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    value={adminNotes} 
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Optional notes for this decision..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger me-auto" onClick={handleReject}>Reject</button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedDecl(null)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={handleApprove}>Approve & Deduct</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthManagement;
