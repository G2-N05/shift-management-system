import { useState, useEffect } from 'react';

function KPIDashboard() {
  const [users, setUsers] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Edit KPI state
  const [editingKPI, setEditingKPI] = useState(null);
  const [score, setScore] = useState(50);
  const [multiplier, setMultiplier] = useState(1.0);
  const [notes, setNotes] = useState('');

  // Base Hourly Rate state
  const [editingUser, setEditingUser] = useState(null);
  const [baseRate, setBaseRate] = useState(20);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [usersRes, kpisRes] = await Promise.all([
        fetch('http://localhost:8080/api/users', { headers }),
        fetch(`http://localhost:8080/api/kpis?month=${month}&year=${year}`, { headers })
      ]);
      const usersData = await usersRes.json();
      const kpisData = await kpisRes.json();
      
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(kpisData)) setKpis(kpisData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getKPIForUser = (userId) => {
    return kpis.find(k => k.UserID === userId);
  };

  const openKPIEdit = (user) => {
    const kpi = getKPIForUser(user.ID);
    setEditingKPI(user);
    if (kpi) {
      setScore(kpi.Score);
      setMultiplier(kpi.Multiplier);
      setNotes(kpi.Notes || '');
    } else {
      setScore(50);
      setMultiplier(1.0);
      setNotes('');
    }
  };

  const handleSaveKPI = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8080/api/kpis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          UserID: editingKPI.ID,
          Month: month,
          Year: year,
          Score: parseInt(score),
          Multiplier: parseFloat(multiplier),
          Notes: notes
        })
      });
      setEditingKPI(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openRateEdit = (user) => {
    setEditingUser(user);
    setBaseRate(user.BaseHourlyRate || 20);
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedUser = { ...editingUser, BaseHourlyRate: parseFloat(baseRate) };
      await fetch(`http://localhost:8080/api/users/${editingUser.ID}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });
      setEditingUser(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold text-primary">KPI & Compensation Management</h5>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm w-auto" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Month {m}</option>
            ))}
          </select>
          <select className="form-select form-select-sm w-auto" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[year-1, year, year+1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4">Employee</th>
                <th>Role</th>
                <th>Base Hr Rate</th>
                <th>KPI Score (0-100)</th>
                <th>Bonus Multiplier</th>
                <th>Notes</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const kpi = getKPIForUser(u.ID);
                return (
                  <tr key={u.ID}>
                    <td className="px-4 fw-medium">
                      <div className="d-flex align-items-center">
                        <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                          {u.Name.charAt(0)}
                        </div>
                        {u.Name}
                      </div>
                    </td>
                    <td><span className={`badge ${u.Role === 'admin' ? 'bg-danger' : u.Role === 'manager' ? 'bg-warning' : 'bg-info'} bg-opacity-10 text-${u.Role === 'admin' ? 'danger' : u.Role === 'manager' ? 'warning' : 'info'} border border-opacity-25`}>{u.Role}</span></td>
                    <td>
                      <span className="fw-semibold">${(u.BaseHourlyRate || 20).toFixed(2)}/h</span>
                      <button className="btn btn-sm btn-link text-muted p-0 ms-2" onClick={() => openRateEdit(u)}><i className="bi bi-pencil-square"></i></button>
                    </td>
                    <td>
                      {kpi ? (
                        <div className="d-flex align-items-center">
                          <div className="progress w-100 me-2" style={{height: '6px'}}>
                            <div className={`progress-bar ${kpi.Score >= 80 ? 'bg-success' : kpi.Score >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{width: `${kpi.Score}%`}}></div>
                          </div>
                          <span className="small fw-bold">{kpi.Score}</span>
                        </div>
                      ) : <span className="text-muted small">Not Set</span>}
                    </td>
                    <td>{kpi ? <span className="badge bg-success bg-opacity-10 text-success">{kpi.Multiplier}x</span> : '-'}</td>
                    <td className="text-muted small text-truncate" style={{maxWidth: '150px'}}>{kpi ? kpi.Notes : ''}</td>
                    <td className="text-end px-4">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openKPIEdit(u)}>
                        Set KPI
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingKPI && (
        <div className="modal d-block z-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Set KPI for {editingKPI.Name}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingKPI(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveKPI}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">KPI Score (0-100)</label>
                    <input type="range" className="form-range" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} />
                    <div className="text-center fw-bold fs-5 text-primary">{score}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Bonus Multiplier (e.g. 1.0 is no bonus, 1.2 is 20% bonus)</label>
                    <input type="number" step="0.1" min="0.5" max="3.0" className="form-control" value={multiplier} onChange={e => setMultiplier(e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small">Notes / Evaluation</label>
                    <textarea className="form-control" rows="3" value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setEditingKPI(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save KPI</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal d-block z-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h6 className="modal-title">Base Rate: {editingUser.Name}</h6>
                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveRate}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Hourly Rate ($)</label>
                    <input type="number" step="0.5" min="0" className="form-control" value={baseRate} onChange={e => setBaseRate(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Update Rate</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KPIDashboard;
