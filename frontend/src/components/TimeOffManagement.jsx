import { useState, useEffect } from 'react';

function TimeOffManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [reqsRes, usersRes] = await Promise.all([
        fetch('http://localhost:8080/api/time-off/pending', { headers }),
        fetch('http://localhost:8080/api/users', { headers })
      ]);
      
      const reqsData = await reqsRes.json();
      const usersData = await usersRes.json();

      if (Array.isArray(reqsData)) setRequests(reqsData);
      
      if (Array.isArray(usersData)) {
        const userMap = {};
        usersData.forEach(u => userMap[u.ID] = u.Name);
        setUsers(userMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8080/api/time-off/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold text-primary">Time Off Requests</h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={fetchData}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Employee</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.ID}>
                    <td className="px-4 fw-medium">{users[req.UserID] || `User #${req.UserID}`}</td>
                    <td>
                      {new Date(req.StartDate).toLocaleDateString()} <i className="bi bi-arrow-right text-muted mx-1"></i> {new Date(req.EndDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${req.DurationHours < 8 ? 'bg-info' : 'bg-primary'} bg-opacity-10 text-dark border`}>
                        {req.DurationHours} hours
                      </span>
                    </td>
                    <td className="text-muted">{req.Reason}</td>
                    <td>
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">Pending</span>
                    </td>
                    <td className="text-end px-4">
                      <button className="btn btn-sm btn-success me-2" onClick={() => handleAction(req.ID, 'approve')}>
                        Approve
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(req.ID, 'reject')}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No pending time off requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimeOffManagement;
