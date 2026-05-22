import { useState, useEffect } from 'react';

function ShiftDashboard() {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userId, setUserId] = useState('');
  const [locationId, setLocationId] = useState('1'); 
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Edit state
  const [editingShift, setEditingShift] = useState(null);
  const [editUserId, setEditUserId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsRes, usersRes] = await Promise.all([
        fetch('http://localhost:8080/api/shifts'),
        fetch('http://localhost:8080/api/users')
      ]);
      const shiftsData = await shiftsRes.json();
      const usersData = await usersRes.json();
      
      if (Array.isArray(shiftsData)) setShifts(shiftsData);
      if (Array.isArray(usersData)) setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8080/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          UserID: parseInt(userId), 
          LocationID: parseInt(locationId),
          StartTime: new Date(startTime).toISOString(),
          EndTime: new Date(endTime).toISOString(),
          Status: 'scheduled'
        })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getUserName = (id) => {
    const user = users.find(u => u.ID === id);
    return user ? user.Name : `User #${id}`;
  };

  const handleEdit = (s) => {
    setEditingShift(s);
    setEditUserId(s.UserID);
    setEditNotes(s.Notes || '');
    setEditStatus(s.Status || 'scheduled');
    
    const formatForInput = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };
    
    setEditStartTime(formatForInput(s.StartTime));
    setEditEndTime(formatForInput(s.EndTime));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8080/api/shifts/${editingShift.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          UserID: parseInt(editUserId),
          StartTime: new Date(editStartTime).toISOString(),
          EndTime: new Date(editEndTime).toISOString(),
          Notes: editNotes,
          Status: editStatus
        })
      });
      setEditingShift(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this shift?")) return;
    try {
      await fetch(`http://localhost:8080/api/shifts/${id}`, { method: 'DELETE' });
      setEditingShift(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header">Schedule Shift</div>
          <div className="card-body">
            <form onSubmit={handleSchedule}>
              <div className="mb-3">
                <label className="form-label text-muted small">Employee</label>
                <select className="form-select" value={userId} onChange={(e) => setUserId(e.target.value)} required>
                  <option value="" disabled>Select Employee</option>
                  {users.map(u => (
                    <option key={u.ID} value={u.ID}>{u.Name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Start Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small">End Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Assign Shift</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card h-100">
          <div className="card-header">Upcoming Shifts</div>
          <div className="card-body p-0 table-responsive">
            {loading ? <div className="p-4 text-center text-muted">Loading...</div> : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">Employee</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s.ID}>
                      <td className="px-4 fw-medium">{getUserName(s.UserID)}</td>
                      <td className="text-muted">{new Date(s.StartTime).toLocaleString()}</td>
                      <td className="text-muted">{new Date(s.EndTime).toLocaleString()}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                          {s.Status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(s)}>
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                     <tr><td colSpan="4" className="text-center py-4 text-muted">No shifts scheduled yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      {editingShift && (
        <div className="modal d-block z-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Edit Shift #{editingShift.ID}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingShift(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Assigned To (User ID)</label>
                    <select className="form-select" value={editUserId} onChange={(e) => setEditUserId(e.target.value)} required>
                      {users.map(u => (
                        <option key={u.ID} value={u.ID}>#{u.ID} - {u.Name} (Lv {u.SkillLevel})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Task Description / Notes</label>
                    <input type="text" className="form-control" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Start Time</label>
                    <input type="datetime-local" className="form-control" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">End Time</label>
                    <input type="datetime-local" className="form-control" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small">Status</label>
                    <select className="form-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(editingShift.ID)}>Delete Shift</button>
                    <div>
                      <button type="button" className="btn btn-light me-2" onClick={() => setEditingShift(null)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftDashboard;
