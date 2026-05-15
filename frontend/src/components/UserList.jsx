import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [skillLevel, setSkillLevel] = useState(1);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(40);
  
  // Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('employee');
  const [editSkillLevel, setEditSkillLevel] = useState(1);
  const [editMaxWeeklyHours, setEditMaxWeeklyHours] = useState(40);
  
  // Track Work State
  const [trackingUser, setTrackingUser] = useState(null);
  const [userShifts, setUserShifts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/users');
      const usersData = await res.json();
      
      if (Array.isArray(usersData)) setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditName(user.Name);
    setEditEmail(user.Email);
    setEditRole(user.Role);
    setEditSkillLevel(user.SkillLevel);
    setEditMaxWeeklyHours(user.MaxWeeklyHours);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8080/api/users/${editingUser.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editName, 
          email: editEmail, 
          role: editRole, 
          skillLevel: parseInt(editSkillLevel), 
          maxWeeklyHours: parseInt(editMaxWeeklyHours) 
        })
      });
      setEditingUser(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackWork = async (user) => {
    setTrackingUser(user);
    setUserShifts([]);
    try {
      const res = await fetch('http://localhost:8080/api/shifts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserShifts(data.filter(s => s.UserID === user.ID));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, skillLevel: parseInt(skillLevel), maxWeeklyHours: parseInt(maxWeeklyHours) })
      });
      setName('');
      setEmail('');
      setSkillLevel(1);
      setMaxWeeklyHours(40);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header">Add New Member</div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label text-muted small">Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Email Address</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small">Role</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Skill Level (1-5)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={skillLevel} 
                  onChange={(e) => setSkillLevel(e.target.value)} 
                  min="1" max="5"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small">Max Weekly OT Limit (Hours)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={maxWeeklyHours} 
                  onChange={(e) => setMaxWeeklyHours(e.target.value)} 
                  min="1" max="100"
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Add Member</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card h-100">
          <div className="card-header">Team Directory</div>
          <div className="card-body p-0 table-responsive">
            {loading ? <div className="p-4 text-center text-muted">Loading...</div> : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Skill</th>
                    <th>Max Hrs</th>
                    <th>Energy</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    return (
                      <tr key={u.ID}>
                        <td className="px-4 text-muted">#{u.ID}</td>
                        <td className="fw-medium">{u.Name}</td>
                        <td className="text-muted">{u.Email}</td>
                        <td>
                          <span className={`badge ${u.Role === 'admin' ? 'bg-secondary' : 'bg-light text-dark border'}`}>
                            {u.Role}
                          </span>
                        </td>
                        <td>Level {u.SkillLevel || 1}</td>
                        <td>{u.MaxWeeklyHours || 40}h</td>
                        <td style={{width: '150px'}}>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1" style={{height: '8px'}}>
                              <div 
                                className={`progress-bar ${u.EnergyScore > 70 ? 'bg-success' : u.EnergyScore > 40 ? 'bg-warning' : 'bg-danger'}`} 
                                role="progressbar" 
                                style={{width: `${Math.max(0, Math.min(100, u.EnergyScore !== undefined ? u.EnergyScore : 100))}%`}}
                                aria-valuenow={u.EnergyScore || 100} 
                                aria-valuemin="0" 
                                aria-valuemax="100">
                              </div>
                            </div>
                            <span className="ms-2 small fw-bold">{u.EnergyScore !== undefined ? u.EnergyScore : 100}</span>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-info py-0 px-2 me-1" onClick={() => handleTrackWork(u)}>
                            Track
                          </button>
                          <button className="btn btn-sm btn-outline-primary py-0 px-2 me-1" onClick={() => handleEditClick(u)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDelete(u.ID)}>
                            Del
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr><td colSpan="8" className="text-center py-4 text-muted">No users found. Add some!</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Edit User #{editingUser.ID}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Full Name</label>
                    <input type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Email Address</label>
                    <input type="email" className="form-control" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Role</label>
                    <select className="form-select" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Skill Level (1-5)</label>
                    <input type="number" className="form-control" value={editSkillLevel} onChange={(e) => setEditSkillLevel(e.target.value)} min="1" max="5" required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small">Max Weekly OT Limit (Hours)</label>
                    <input type="number" className="form-control" value={editMaxWeeklyHours} onChange={(e) => setEditMaxWeeklyHours(e.target.value)} min="1" max="100" required />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-light me-2" onClick={() => setEditingUser(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {trackingUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">Work Tracking: {trackingUser.Name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setTrackingUser(null)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="list-group list-group-flush">
                  {userShifts.length === 0 ? (
                    <div className="p-4 text-center text-muted">No shifts assigned to this user.</div>
                  ) : (
                    userShifts.map(s => (
                      <div key={s.ID} className="list-group-item p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold">{s.Notes || `Shift #${s.ID}`}</span>
                          <span className={`badge ${s.Status === 'completed' ? 'bg-success' : s.Status === 'in_progress' ? 'bg-warning' : 'bg-primary'}`}>
                            {s.Status}
                          </span>
                        </div>
                        <div className="text-muted small">
                          <i className="bi bi-calendar-event me-2"></i>
                          {new Date(s.StartTime).toLocaleString()} - {new Date(s.EndTime).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
