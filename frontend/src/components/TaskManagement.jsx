import { useState, useEffect } from 'react';

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('employee');
  const [requiredSkill, setRequiredSkill] = useState(1);
  const [headcount, setHeadcount] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editRole, setEditRole] = useState('employee');
  const [editRequiredSkill, setEditRequiredSkill] = useState(1);
  const [editHeadcount, setEditHeadcount] = useState(1);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/tasks');
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Title: title,
          RequiredRole: role,
          RequiredSkill: parseInt(requiredSkill),
          Headcount: parseInt(headcount),
          StartTime: new Date(startTime).toISOString(),
          EndTime: new Date(endTime).toISOString()
        })
      });
      setTitle('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditTitle(task.Title);
    setEditRole(task.RequiredRole);
    setEditRequiredSkill(task.RequiredSkill);
    setEditHeadcount(task.Headcount);
    
    // Format dates for datetime-local input
    const formatForInput = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      // Adjust for local timezone offset
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };
    
    setEditStartTime(formatForInput(task.StartTime));
    setEditEndTime(formatForInput(task.EndTime));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8080/api/tasks/${editingTask.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Title: editTitle,
          RequiredRole: editRole,
          RequiredSkill: parseInt(editRequiredSkill),
          Headcount: parseInt(editHeadcount),
          StartTime: new Date(editStartTime).toISOString(),
          EndTime: new Date(editEndTime).toISOString()
        })
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task requirement?")) return;
    try {
      await fetch(`http://localhost:8080/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="card h-100">
          <div className="card-header fw-bold">Create New Task Need</div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label text-muted small">Task Description / Role Need</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Front Desk Coverage"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Required Role</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Required Skill Level</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={requiredSkill} 
                  onChange={(e) => setRequiredSkill(e.target.value)} 
                  min="1" max="5"
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Headcount (People needed)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={headcount} 
                  onChange={(e) => setHeadcount(e.target.value)} 
                  min="1"
                  required 
                />
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
              <button type="submit" className="btn btn-primary w-100">Add Task Need</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span className="fw-bold">Pending Tasks (Unassigned)</span>
            <small className="text-muted">The Auto-Scheduler will assign these automatically.</small>
          </div>
          <div className="card-body p-0 table-responsive">
            {loading ? <div className="p-4 text-center text-muted">Loading...</div> : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">Task</th>
                    <th>Role & Skill</th>
                    <th>Headcount</th>
                    <th>Time Needed</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.ID}>
                      <td className="px-4 fw-medium">{t.Title}</td>
                      <td>
                        <span className="badge bg-light text-dark border me-1">{t.RequiredRole}</span>
                        <span className="badge bg-info text-dark border">Lv {t.RequiredSkill || 1}</span>
                      </td>
                      <td>{t.Headcount || 1} people</td>
                      <td className="text-muted">
                        {new Date(t.StartTime).toLocaleString()} <br/>
                        to {new Date(t.EndTime).toLocaleTimeString()}
                      </td>
                      <td>
                        {t.IsAssigned ? (
                           <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Assigned (Auto)</span>
                        ) : (
                           <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary py-0 px-2 me-1" onClick={() => handleEditClick(t)}>
                          Edit
                        </button>
                        {!t.IsAssigned && (
                          <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDelete(t.ID)}>
                            Del
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No task requirements found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingTask && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Edit Task Requirement</h5>
                <button type="button" className="btn-close" onClick={() => setEditingTask(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Task Description</label>
                    <input type="text" className="form-control" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Required Role</label>
                    <select className="form-select" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Required Skill Level</label>
                    <input type="number" className="form-control" value={editRequiredSkill} onChange={(e) => setEditRequiredSkill(e.target.value)} min="1" max="5" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Headcount</label>
                    <input type="number" className="form-control" value={editHeadcount} onChange={(e) => setEditHeadcount(e.target.value)} min="1" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Start Time</label>
                    <input type="datetime-local" className="form-control" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small">End Time</label>
                    <input type="datetime-local" className="form-control" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} required />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-light me-2" onClick={() => setEditingTask(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
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

export default TaskManagement;
