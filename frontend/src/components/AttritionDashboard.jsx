import { useState, useEffect } from 'react';

function AttritionDashboard() {
  const [users, setUsers] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, risksRes] = await Promise.all([
        fetch('http://localhost:8080/api/users'),
        fetch('http://localhost:8080/api/analytics/attrition')
      ]);
      const usersData = await usersRes.json();
      const risksData = await risksRes.json();
      
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(risksData)) setRisks(risksData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 fw-bold text-danger"><i className="bi bi-activity me-2"></i>Attrition Risk Prediction</h5>
          <small className="text-muted">AI-driven analysis of employee burnout and turnover probability</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchData}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
        </button>
      </div>
      
      <div className="card-body p-0 table-responsive">
        {loading ? <div className="p-4 text-center text-muted">Analyzing workforce data...</div> : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4">Employee</th>
                <th>Role</th>
                <th>Max Hrs (Limit)</th>
                <th>Burnout Score</th>
                <th>Risk Level</th>
                <th>Trend Prediction</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const risk = risks.find(r => r.UserID === u.ID) || { BurnoutScore: 0, RiskLevel: 'Low' };
                let badgeClass = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
                let trendIcon = 'bi-graph-down text-success';
                
                if (risk.RiskLevel === 'Medium') {
                  badgeClass = 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
                  trendIcon = 'bi-dash-lg text-warning';
                } else if (risk.RiskLevel === 'High') {
                  badgeClass = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
                  trendIcon = 'bi-graph-up text-danger';
                }
                
                return (
                  <tr key={u.ID}>
                    <td className="px-4 py-3">
                      <div className="fw-bold">{u.Name}</div>
                      <small className="text-muted">#{u.ID}</small>
                    </td>
                    <td><span className="badge bg-light text-dark border">{u.Role}</span></td>
                    <td className="text-muted">{u.MaxWeeklyHours}h/week</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100 me-2" style={{height: '8px', maxWidth: '100px'}}>
                          <div className={`progress-bar ${risk.RiskLevel === 'High' ? 'bg-danger' : risk.RiskLevel === 'Medium' ? 'bg-warning' : 'bg-success'}`} 
                               role="progressbar" 
                               style={{width: `${risk.BurnoutScore}%`}}></div>
                        </div>
                        <span className="fw-medium">{risk.BurnoutScore}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass} px-3 py-2`}>
                        {risk.RiskLevel} Risk
                      </span>
                    </td>
                    <td>
                       <i className={`bi ${trendIcon} fs-5`}></i>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No workforce data available.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AttritionDashboard;
