import { useState, useEffect } from 'react';

function SuccessionPlanning() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [backupSuggestions, setBackupSuggestions] = useState([]);
  const [showBackupModal, setShowBackupModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFindBackup = async (user) => {
    setSelectedUser(user);
    setShowBackupModal(true);
    setBackupSuggestions([]);
    try {
      const res = await fetch(`http://localhost:8080/api/analytics/backups/${user.ID}`);
      const data = await res.json();
      if (Array.isArray(data)) setBackupSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Group users by role for the matrix view
  const employees = users.filter(u => u.Role === 'employee');
  const managers = users.filter(u => u.Role === 'manager');
  const admins = users.filter(u => u.Role === 'admin');

  const renderUserCard = (u) => (
    <div key={u.ID} className="col-md-4 col-sm-6 mb-3">
      <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="fw-bold mb-0">{u.Name}</h6>
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
              Level {u.SkillLevel}
            </span>
          </div>
          <small className="text-muted d-block mb-3">#{u.ID} • {u.Email}</small>
          <button 
            className="btn btn-sm btn-outline-primary w-100" 
            onClick={() => handleFindBackup(u)}
          >
            <i className="bi bi-search me-1"></i> Find Successor
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="card h-100 shadow-sm border-0 bg-transparent">
      <div className="card-header bg-white border-bottom py-3 rounded shadow-sm mb-4">
        <h5 className="mb-0 fw-bold text-primary"><i className="bi bi-diagram-3 me-2"></i>Succession & Redundancy Planning</h5>
        <small className="text-muted">Skill matrix mapping and automated cross-training backup suggestions</small>
      </div>
      
      <div className="card-body p-0">
        {loading ? <div className="p-4 text-center text-muted bg-white rounded shadow-sm">Loading skill matrix...</div> : (
          <>
            <div className="mb-5">
              <h5 className="border-bottom pb-2 mb-3 text-secondary">Managers (Leadership)</h5>
              <div className="row">
                {managers.length > 0 ? managers.map(renderUserCard) : <div className="col text-muted">No managers found</div>}
              </div>
            </div>
            
            <div className="mb-5">
              <h5 className="border-bottom pb-2 mb-3 text-secondary">Employees (Operations)</h5>
              <div className="row">
                {employees.length > 0 ? employees.map(renderUserCard) : <div className="col text-muted">No employees found</div>}
              </div>
            </div>

            <div className="mb-4">
              <h5 className="border-bottom pb-2 mb-3 text-secondary">Administrators (System)</h5>
              <div className="row">
                {admins.length > 0 ? admins.map(renderUserCard) : <div className="col text-muted">No admins found</div>}
              </div>
            </div>
          </>
        )}
      </div>

      {showBackupModal && selectedUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Successors for: {selectedUser.Name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBackupModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                {backupSuggestions.length === 0 ? (
                  <div className="p-4 text-center">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p className="text-muted">Searching database for matching skill levels...</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {backupSuggestions.map((candidate, idx) => (
                      <div key={candidate.User.ID} className="list-group-item p-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="fw-bold mb-1">
                              #{idx + 1}. {candidate.User.Name}
                              <span className="badge bg-info ms-2">Lv {candidate.User.SkillLevel}</span>
                            </h6>
                            <p className="mb-1 text-muted small">{candidate.MatchReason}</p>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 me-2">
                              Burnout: {candidate.BurnoutScore}%
                            </span>
                          </div>
                          <button className="btn btn-outline-success btn-sm">
                            <i className="bi bi-person-check me-1"></i> Add to On-Call
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuccessionPlanning;
