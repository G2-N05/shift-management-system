import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api';

function CoordinationDashboard() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const userMap = {};
        data.forEach(u => { userMap[u.ID] = u; });
        setUsers(userMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await fetch(`${API_URL}/coordination/understaffed`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch understaffed tasks', error);
    }
    setLoadingTasks(false);
  };

  const fetchSuggestions = async (task) => {
    setSelectedTask(task);
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_URL}/coordination/tasks/${task.ID}/suggestions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions', error);
    }
    setLoadingSuggestions(false);
  };

  const approveSuggestion = async (id) => {
    try {
      const response = await fetch(`${API_URL}/coordination/suggestions/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        // Refresh
        setSelectedTask(null);
        setSuggestions([]);
        fetchTasks();
      } else {
        alert('Failed to approve suggestion');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getUrgencyBadge = (level) => {
    if (level === 'Critical') return <span className="badge bg-danger rounded-pill px-3 shadow-sm">Critical</span>;
    if (level === 'High') return <span className="badge bg-warning text-dark rounded-pill px-3 shadow-sm">High</span>;
    return <span className="badge bg-secondary rounded-pill px-3 shadow-sm">{level}</span>;
  };

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 gradient-text-primary">AI Resource Coordination</h3>
          <p className="text-muted mb-0">Review and resolve understaffed tasks with AI assistance</p>
        </div>
        <button onClick={fetchTasks} className="btn btn-outline-primary shadow-sm btn-hover-lift">
          <i className="bi bi-arrow-clockwise me-2"></i> Refresh
        </button>
      </div>

      <div className="row g-4">
        {/* Left Pane: Tasks */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold mb-0">Understaffed Waitlist</h5>
            </div>
            <div className="card-body p-4">
              {loadingTasks ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">All good! No understaffed tasks.</h5>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tasks.map(task => (
                    <div 
                      key={task.ID}
                      onClick={() => fetchSuggestions(task)}
                      className={`p-3 rounded-4 cursor-pointer transition-all ${selectedTask?.ID === task.ID ? 'bg-primary-subtle border-primary border' : 'bg-light border border-transparent hover-shadow'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{task.Title}</h6>
                        {getUrgencyBadge(task.UrgencyLevel)}
                      </div>
                      <p className="small text-muted mb-2 text-truncate">{task.Description || 'No description'}</p>
                      <div className="d-flex justify-content-between align-items-center text-secondary small">
                        <span><i className="bi bi-calendar3 me-1"></i> {new Date(task.StartTime).toLocaleDateString()}</span>
                        <span><i className="bi bi-people me-1"></i> Missing {task.Headcount} staff</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Suggestions */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white" style={{ minHeight: '500px' }}>
            {!selectedTask ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-5">
                <i className="bi bi-robot text-primary mb-3" style={{ fontSize: '4rem', opacity: 0.5 }}></i>
                <h5>Select a task to view AI suggestions</h5>
                <p>Our AI will analyze schedules, skills, and constraints to find the best resolution.</p>
              </div>
            ) : (
              <div className="d-flex flex-column h-100 fade-in">
                <div className="card-header bg-primary text-white border-bottom-0 p-4 rounded-top-4" style={{ background: 'linear-gradient(135deg, #4A00E0, #8E2DE2)' }}>
                  <h5 className="fw-bold mb-1">AI Resolution: {selectedTask.Title}</h5>
                  <p className="mb-0 text-white-50">Choose the best option below</p>
                </div>
                <div className="card-body p-4 flex-grow-1 overflow-auto">
                  {loadingSuggestions ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-3 text-muted">Running matching algorithm...</p>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="alert alert-warning rounded-4 shadow-sm">
                      <i className="bi bi-exclamation-triangle me-2"></i> No suggestions could be generated.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {suggestions.map(sugg => {
                        const isOvertime = sugg.Type === 'Overtime';
                        const isReschedule = sugg.Type === 'Reschedule';
                        
                        return (
                          <div key={sugg.ID} className={`card border-0 rounded-4 shadow-sm overflow-hidden ${isOvertime ? 'bg-warning-subtle' : isReschedule ? 'bg-secondary-subtle' : 'bg-success-subtle'}`}>
                            <div className="row g-0">
                              <div className="col-md-9 p-4">
                                <div className="d-flex align-items-center mb-2">
                                  <span className={`badge ${isOvertime ? 'bg-warning text-dark' : isReschedule ? 'bg-secondary' : 'bg-success'} rounded-pill px-3 py-2 me-2`}>
                                    <i className={`bi ${isOvertime ? 'bi-clock-history' : isReschedule ? 'bi-calendar-x' : 'bi-person-check'} me-1`}></i>
                                    {sugg.Type}
                                  </span>
                                  {sugg.SuggestedUser && users[sugg.SuggestedUser] && (
                                    <span className="fw-bold text-dark">{users[sugg.SuggestedUser].Name}</span>
                                  )}
                                </div>
                                <p className="mb-3 text-dark">{sugg.Reasoning}</p>
                                
                                <div className="mb-1 d-flex justify-content-between">
                                  <small className="text-muted fw-bold">Risk Assessment</small>
                                  <small className={sugg.RiskScore > 70 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{sugg.RiskScore}/100</small>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div 
                                    className={`progress-bar ${sugg.RiskScore > 70 ? 'bg-danger' : sugg.RiskScore > 40 ? 'bg-warning' : 'bg-success'}`} 
                                    role="progressbar" 
                                    style={{ width: `${sugg.RiskScore}%` }} 
                                  ></div>
                                </div>
                              </div>
                              <div className="col-md-3 d-flex align-items-stretch border-start border-white border-opacity-50">
                                <button 
                                  onClick={() => approveSuggestion(sugg.ID)}
                                  className={`btn w-100 h-100 fw-bold border-0 rounded-0 d-flex flex-column align-items-center justify-content-center btn-hover-lift ${isOvertime ? 'btn-outline-warning text-dark' : isReschedule ? 'btn-outline-secondary' : 'btn-outline-success text-dark'}`}
                                >
                                  <i className="bi bi-check2-circle mb-2" style={{ fontSize: '2rem' }}></i>
                                  Approve
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoordinationDashboard;
