import { useState, useEffect } from 'react';

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('employee');
  const [requiredSkill, setRequiredSkill] = useState(1);
  const [headcount, setHeadcount] = useState(1);
  const [workModel, setWorkModel] = useState('Parallel');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editRole, setEditRole] = useState('employee');
  const [editRequiredSkill, setEditRequiredSkill] = useState(1);
  const [editHeadcount, setEditHeadcount] = useState(1);
  const [editWorkModel, setEditWorkModel] = useState('Parallel');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  // Missing people popup state
  const [missingPeopleTask, setMissingPeopleTask] = useState(null);
  const [replacementSearch, setReplacementSearch] = useState('');
  const [replacementRoleFilter, setReplacementRoleFilter] = useState('');
  const [chosenUsers, setChosenUsers] = useState([]); // Array of user objects

  // Calculate the minimum allowed datetime (today at 00:00)
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    fetchTasksAndUsers();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    setMinDateTime(today.toISOString().slice(0, 16));
  }, []);

  const fetchTasksAndUsers = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('http://localhost:8080/api/tasks'),
        fetch('http://localhost:8080/api/users')
      ]);
      const tasksData = await tasksRes.json();
      const usersData = await usersRes.json();
      
      if (Array.isArray(tasksData)) setTasks(tasksData);
      if (Array.isArray(usersData)) setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (new Date(startTime) < startOfToday) {
      alert("Cannot create a task for a past date!");
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Title: title,
          LocationID: 1,
          RequiredRole: role,
          RequiredSkill: parseInt(requiredSkill),
          Headcount: parseInt(headcount),
          WorkModel: workModel,
          StartTime: new Date(startTime).toISOString(),
          EndTime: new Date(endTime).toISOString()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || 'Failed to create task');
        return;
      }
      const createdTask = await res.json();
      
      setTitle('');
      
      // Force auto-schedule right away to see if headcount is fulfilled
      await fetch('http://localhost:8080/api/tasks/auto-schedule', { method: 'POST' });
      
      // Fetch fresh tasks
      const checkRes = await fetch('http://localhost:8080/api/tasks');
      const allTasks = await checkRes.json();
      if (Array.isArray(allTasks)) setTasks(allTasks);
      
      // Find the newly created task to check its assignment status
      const updatedTask = allTasks.find(t => t.ID === createdTask.ID);
      if (updatedTask && !updatedTask.IsAssigned) {
        // Not enough people! Open the popup
        setMissingPeopleTask(updatedTask);
        setChosenUsers([]); // reset
      }
      
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUser = (u) => {
    if (chosenUsers.find(x => x.ID === u.ID)) {
      setChosenUsers(chosenUsers.filter(x => x.ID !== u.ID));
    } else {
      setChosenUsers([...chosenUsers, u]);
    }
  };

  const handleConfirmReplacements = async () => {
    try {
      // Create shifts for all chosen users
      for (const u of chosenUsers) {
        await fetch('http://localhost:8080/api/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UserID: u.ID,
            TaskID: missingPeopleTask.ID,
            LocationID: missingPeopleTask.LocationID || 1,
            StartTime: missingPeopleTask.StartTime,
            EndTime: missingPeopleTask.EndTime,
            Notes: missingPeopleTask.Title,
            Status: 'scheduled'
          })
        });
      }
      
      // Force update task to assigned since admin confirmed the chosen people
      await fetch(`http://localhost:8080/api/tasks/${missingPeopleTask.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...missingPeopleTask,
          IsAssigned: true
        })
      });

      setMissingPeopleTask(null);
      setChosenUsers([]);
      fetchTasksAndUsers();
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
    setEditWorkModel(task.WorkModel || 'Parallel');
    
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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (new Date(editStartTime) < startOfToday) {
      alert("Cannot update a task to a past date!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${editingTask.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Title: editTitle,
          RequiredRole: editRole,
          RequiredSkill: parseInt(editRequiredSkill),
          Headcount: parseInt(editHeadcount),
          WorkModel: editWorkModel,
          StartTime: new Date(editStartTime).toISOString(),
          EndTime: new Date(editEndTime).toISOString()
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || 'Failed to update task');
        return;
      }
      setEditingTask(null);
      fetchTasksAndUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task requirement?")) return;
    try {
      await fetch(`http://localhost:8080/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasksAndUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter users for the replacement popup
  const filteredReplacementUsers = users.filter(u => {
    if (replacementSearch && !u.Name.toLowerCase().includes(replacementSearch.toLowerCase())) return false;
    if (replacementRoleFilter && u.Role !== replacementRoleFilter) return false;
    return true;
  });

  return (
    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 fw-bold">Create New Task Need</div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Task Description / Role Need</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Front Desk Coverage"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label text-muted small fw-semibold">Required Role</label>
                  <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small fw-semibold">Required Skill Level</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={requiredSkill} 
                    onChange={(e) => setRequiredSkill(e.target.value)} 
                    min="1" max="5"
                    required 
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label text-muted small fw-semibold">Headcount</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={headcount} 
                    onChange={(e) => setHeadcount(e.target.value)} 
                    min="1"
                    required 
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small fw-semibold">Work Model</label>
                  <select className="form-select" value={workModel} onChange={(e) => setWorkModel(e.target.value)}>
                    <option value="Parallel">Parallel</option>
                    <option value="Sequential">Sequential</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Start Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={startTime} 
                  min={minDateTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartTime(newStart);
                    if (!endTime || new Date(newStart) > new Date(endTime)) {
                      const d = new Date(newStart);
                      d.setHours(d.getHours() + 8);
                      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                      setEndTime(d.toISOString().slice(0, 16));
                    }
                  }} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">End Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={endTime} 
                  min={minDateTime}
                  onChange={(e) => setEndTime(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-medium">Add Task Need</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <span className="fw-bold">Pending Tasks (Unassigned)</span>
            <small className="text-muted">The Auto-Scheduler will assign these automatically.</small>
          </div>
          <div className="card-body p-0 table-responsive">
            {loading ? <div className="p-5 text-center text-muted"><div className="spinner-border text-primary mb-3" role="status"></div><div>Loading tasks...</div></div> : (
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 fw-semibold text-muted">Task</th>
                    <th className="py-3 fw-semibold text-muted">Role & Skill</th>
                    <th className="py-3 fw-semibold text-muted">Headcount</th>
                    <th className="py-3 fw-semibold text-muted">Model</th>
                    <th className="py-3 fw-semibold text-muted">Time Needed</th>
                    <th className="py-3 fw-semibold text-muted">Status</th>
                    <th className="py-3 text-end px-4 fw-semibold text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.ID}>
                      <td className="px-4 fw-medium py-3">{t.Title}</td>
                      <td className="py-3">
                        <span className="badge bg-light text-dark border me-1">{t.RequiredRole}</span>
                        <span className="badge bg-info text-dark border">Lv {t.RequiredSkill || 1}</span>
                      </td>
                      <td className="py-3">{t.Headcount || 1} <i className="bi bi-people ms-1 text-muted"></i></td>
                      <td className="py-3">
                        <span className={`badge ${t.WorkModel === 'Sequential' ? 'bg-secondary' : 'bg-primary'} bg-opacity-10 text-dark border`}>
                          {t.WorkModel || 'Parallel'}
                        </span>
                      </td>
                      <td className="text-muted py-3 small">
                        {new Date(t.StartTime).toLocaleString(undefined, {dateStyle: 'short', timeStyle: 'short'})} <br/>
                        to {new Date(t.EndTime).toLocaleString(undefined, {dateStyle: 'short', timeStyle: 'short'})}
                      </td>
                      <td className="py-3">
                        {t.IsAssigned ? (
                           <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Assigned (Auto)</span>
                        ) : (
                           <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 text-end px-4">
                        <button className="btn btn-sm btn-light border me-1" onClick={() => handleEditClick(t)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        {!t.IsAssigned && (
                          <button className="btn btn-sm btn-outline-danger border" onClick={() => handleDelete(t.ID)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-list-task fs-1 d-block mb-3 text-black-50"></i>
                      No task requirements found.
                    </td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {missingPeopleTask && (
        <div className="modal d-block z-3" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning bg-opacity-10 border-warning border-opacity-25 pb-3">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                  Headcount Unfulfilled
                </h5>
                <button type="button" className="btn-close" onClick={() => {
                  setMissingPeopleTask(null);
                  setChosenUsers([]);
                }}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-warning border-0 bg-warning bg-opacity-10">
                  <p className="mb-0">
                    The Auto-Scheduler could not find enough available employees matching <strong>Level {missingPeopleTask.RequiredSkill} {missingPeopleTask.RequiredRole}</strong> to fulfill the required headcount of <strong>{missingPeopleTask.Headcount}</strong> for <strong>"{missingPeopleTask.Title}"</strong>.
                  </p>
                  <p className="mb-0 mt-2">
                    Please manually select replacement employee(s) below. You can assign employees of <strong>any skill level</strong> to fulfill the remaining spots.
                  </p>
                </div>
                
                <div className="row g-2 mb-3">
                  <div className="col-md-8">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search employee by name..." 
                      value={replacementSearch}
                      onChange={(e) => setReplacementSearch(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <select className="form-select" value={replacementRoleFilter} onChange={(e) => setReplacementRoleFilter(e.target.value)}>
                      <option value="">All Roles</option>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive border rounded" style={{maxHeight: '300px'}}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th className="px-3">Employee Name</th>
                        <th>Role</th>
                        <th>Level</th>
                        <th className="text-end px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReplacementUsers.map(u => (
                        <tr key={u.ID} className={chosenUsers.find(x => x.ID === u.ID) ? "table-success" : ""}>
                          <td className="px-3 fw-medium">{u.Name}</td>
                          <td>{u.Role}</td>
                          <td>
                            <span className={`badge ${u.SkillLevel >= missingPeopleTask.RequiredSkill ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-dark border`}>
                              Lv {u.SkillLevel}
                            </span>
                          </td>
                          <td className="text-end px-3">
                            <button 
                              className={`btn btn-sm ${chosenUsers.find(x => x.ID === u.ID) ? 'btn-success' : 'btn-outline-primary'}`} 
                              onClick={() => toggleUser(u)}
                            >
                              {chosenUsers.find(x => x.ID === u.ID) ? <><i className="bi bi-check2"></i> Chosen</> : 'Select'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredReplacementUsers.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-4 text-muted">No employees match the filter.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
              <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex justify-content-between align-items-center">
                <span className="text-muted">Selected: <strong>{chosenUsers.length}</strong> / {missingPeopleTask.Headcount}</span>
                <div>
                  <button type="button" className="btn btn-light me-2" onClick={() => {
                    setMissingPeopleTask(null);
                    setChosenUsers([]);
                  }}>
                    Keep Unassigned
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    disabled={chosenUsers.length === 0}
                    onClick={handleConfirmReplacements}
                  >
                    Confirm {chosenUsers.length} Replacements
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="modal d-block z-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Task Requirement</h5>
                <button type="button" className="btn-close" onClick={() => setEditingTask(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Task Description</label>
                    <input type="text" className="form-control" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Required Role</label>
                      <select className="form-select" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Required Skill Level</label>
                      <input type="number" className="form-control" value={editRequiredSkill} onChange={(e) => setEditRequiredSkill(e.target.value)} min="1" max="5" required />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Headcount</label>
                      <input type="number" className="form-control" value={editHeadcount} onChange={(e) => setEditHeadcount(e.target.value)} min="1" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Work Model</label>
                      <select className="form-select" value={editWorkModel} onChange={(e) => setEditWorkModel(e.target.value)}>
                        <option value="Parallel">Parallel</option>
                        <option value="Sequential">Sequential</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Start Time</label>
                      <input type="datetime-local" className="form-control" value={editStartTime} min={minDateTime} onChange={(e) => setEditStartTime(e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">End Time</label>
                      <input type="datetime-local" className="form-control" value={editEndTime} min={minDateTime} onChange={(e) => setEditEndTime(e.target.value)} required />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end pt-3 border-top">
                    <button type="button" className="btn btn-light me-2" onClick={() => setEditingTask(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-4">Save</button>
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
