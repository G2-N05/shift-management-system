import { useState, useEffect } from 'react';

function ShiftDashboard() {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filterUserId, setFilterUserId] = useState(''); // '' means 'All'
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Edit state
  const [editingShift, setEditingShift] = useState(null);
  const [editUserId, setEditUserId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [viewingProof, setViewingProof] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, usersRes] = await Promise.all([
        fetch('http://localhost:8080/api/shifts'),
        fetch('http://localhost:8080/api/users')
      ]);
      const shiftsData = await shiftsRes.json();
      const usersData = await usersRes.json();
      
      if (Array.isArray(shiftsData)) {
        // Sort shifts by start time descending by default
        shiftsData.sort((a, b) => new Date(b.StartTime) - new Date(a.StartTime));
        setShifts(shiftsData);
      }
      if (Array.isArray(usersData)) setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  // Filter shifts based on criteria
  const filteredShifts = shifts.filter(s => {
    if (filterUserId && s.UserID.toString() !== filterUserId) return false;
    
    if (filterStartDate) {
      const shiftDate = new Date(s.StartTime);
      const startFilter = new Date(filterStartDate);
      startFilter.setHours(0, 0, 0, 0);
      if (shiftDate < startFilter) return false;
    }
    
    if (filterEndDate) {
      const shiftDate = new Date(s.EndTime);
      const endFilter = new Date(filterEndDate);
      endFilter.setHours(23, 59, 59, 999);
      if (shiftDate > endFilter) return false;
    }
    
    return true;
  });

  return (
    <div className="container-fluid p-0">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Statement Filter</h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label text-muted small fw-semibold">Employee</label>
                  <select className="form-select" value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)}>
                    <option value="">All Employees</option>
                    {users.map(u => (
                      <option key={u.ID} value={u.ID}>{u.Name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted small fw-semibold">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={filterStartDate} 
                    onChange={(e) => setFilterStartDate(e.target.value)} 
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-muted small fw-semibold">End Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={filterEndDate} 
                    onChange={(e) => setFilterEndDate(e.target.value)} 
                  />
                </div>
                <div className="col-md-3">
                  <button className="btn btn-primary w-100 fw-medium" onClick={() => fetchData()}>
                    <i className="bi bi-arrow-clockwise me-2"></i>Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Shift Records</h5>
              <span className="badge bg-primary rounded-pill px-3 py-2">{filteredShifts.length} Records Found</span>
            </div>
            <div className="card-body p-0 table-responsive">
              {loading ? <div className="p-5 text-center text-muted"><div className="spinner-border text-primary mb-3" role="status"></div><div>Loading records...</div></div> : (
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3 text-muted fw-semibold">Employee</th>
                      <th className="py-3 text-muted fw-semibold">Start Time</th>
                      <th className="py-3 text-muted fw-semibold">End Time</th>
                      <th className="py-3 text-muted fw-semibold">Task/Notes</th>
                      <th className="py-3 text-muted fw-semibold">Status</th>
                      <th className="py-3 text-end px-4 text-muted fw-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShifts.map(s => (
                      <tr key={s.ID}>
                        <td className="px-4 py-3 fw-medium">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '36px', height: '36px', fontSize: '14px'}}>
                              {getUserName(s.UserID).charAt(0).toUpperCase()}
                            </div>
                            {getUserName(s.UserID)}
                          </div>
                        </td>
                        <td className="py-3">{new Date(s.StartTime).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})}</td>
                        <td className="py-3">{new Date(s.EndTime).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})}</td>
                        <td className="py-3 text-muted">{s.Notes || '-'}</td>
                        <td className="py-3">
                          <span className={`badge px-3 py-2 ${s.Status === 'completed' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : s.Status === 'in_progress' ? 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25' : 'bg-info bg-opacity-10 text-info border border-info border-opacity-25'}`}>
                            {s.Status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-end px-4">
                          {s.ProofImage && (
                            <button className="btn btn-sm btn-info text-white me-2" onClick={() => setViewingProof(s.ProofImage)}>
                              <i className="bi bi-image"></i> Proof
                            </button>
                          )}
                          <button className="btn btn-sm btn-light border me-2" onClick={() => handleEdit(s)}>
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredShifts.length === 0 && (
                       <tr><td colSpan="6" className="text-center py-5 text-muted">
                         <i className="bi bi-inbox fs-1 d-block mb-3 text-black-50"></i>
                         No shifts match your filter criteria.
                       </td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {editingShift && (
        <div className="modal d-block z-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Shift Record</h5>
                <button type="button" className="btn-close" onClick={() => setEditingShift(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Assigned Employee</label>
                    <select className="form-select" value={editUserId} onChange={(e) => setEditUserId(e.target.value)} required>
                      {users.map(u => (
                        <option key={u.ID} value={u.ID}>{u.Name} (Lv {u.SkillLevel})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Task Description / Notes</label>
                    <input type="text" className="form-control" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} required />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Start Time</label>
                      <input type="datetime-local" className="form-control" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">End Time</label>
                      <input type="datetime-local" className="form-control" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">Status</label>
                    <select className="form-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-between pt-3 border-top">
                    <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(editingShift.ID)}>
                      <i className="bi bi-trash3 me-2"></i>Delete
                    </button>
                    <div>
                      <button type="button" className="btn btn-light me-2" onClick={() => setEditingShift(null)}>Cancel</button>
                      <button type="submit" className="btn btn-primary px-4">Save</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingProof && (
        <div className="modal d-block z-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 bg-transparent shadow-none">
              <div className="modal-header border-0 justify-content-end p-2">
                <button type="button" className="btn-close btn-close-white fs-4" onClick={() => setViewingProof(null)}></button>
              </div>
              <div className="modal-body text-center p-0">
                <img src={viewingProof} alt="Proof of Work" className="img-fluid rounded shadow-lg" style={{ maxHeight: '80vh', objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftDashboard;
