import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

function ShiftCalendar() {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('week');
  
  // Edit Shift State
  const [editingShift, setEditingShift] = useState(null);
  const [editUserId, setEditUserId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsRes, usersRes] = await Promise.all([
        fetch('http://localhost:8080/api/shifts'),
        fetch('http://localhost:8080/api/users')
      ]);
      const shiftsData = await shiftsRes.json();
      const usersData = await usersRes.json();
      
      if (Array.isArray(usersData)) setUsers(usersData);
      
      if (Array.isArray(shiftsData)) {
        let events = shiftsData.map(s => {
          const user = usersData.find(u => u.ID === s.UserID);
          const userName = user ? user.Name : `User #${s.UserID}`;
          return {
            title: `${userName} - ${s.Notes || 'Shift'}`,
            start: new Date(s.StartTime),
            end: new Date(s.EndTime),
            resource: s,
          };
        });

        // Group by user to calculate breaks
        const userShifts = {};
        shiftsData.forEach(s => {
          if (!userShifts[s.UserID]) userShifts[s.UserID] = [];
          userShifts[s.UserID].push(s);
        });

        Object.keys(userShifts).forEach(uid => {
          const sorted = userShifts[uid].sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));
          const user = usersData.find(u => u.ID === parseInt(uid));
          const userName = user ? user.Name : `User #${uid}`;
          
          for (let i = 0; i < sorted.length - 1; i++) {
            const endCurrent = new Date(sorted[i].EndTime);
            const startNext = new Date(sorted[i+1].StartTime);
            
            // Only draw break if there is a gap
            if (endCurrent < startNext) {
              events.push({
                title: `🛌 ${userName} - Rest Period`,
                start: endCurrent,
                end: startNext,
                resource: { Status: 'break' }
              });
            }
          }
        });

        setShifts(events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!window.confirm("Are you sure you want to run the auto-scheduler? This will wipe all future shifts and generate new ones using the latest staff.")) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/tasks/re-schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Success! Generated ${data.shiftsScheduled} new shifts.`);
        fetchData();
      } else {
        alert('Failed to run auto-scheduler.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    if (event.resource && event.resource.Status === 'break') {
      return {
        style: {
          backgroundColor: '#e9ecef',
          color: '#6c757d',
          border: '1px dashed #adb5bd',
          opacity: 0.7,
          borderRadius: '6px',
          display: 'block',
          fontSize: '0.85rem'
        }
      };
    }

    let backgroundColor = '#3174ad'; // Default blue
    if (event.resource.Status === 'completed') {
      backgroundColor = '#198754'; // Success green
    } else if (event.resource.Status === 'in_progress') {
      backgroundColor = '#fd7e14'; // Warning orange
    } else if (event.resource.Status === 'assigned') {
      backgroundColor = '#0dcaf0'; // Info cyan
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem'
      }
    };
  };

  const handleSelectEvent = (event) => {
    if (event.resource && event.resource.Status === 'break') return;
    const s = event.resource;
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
    if (!window.confirm("Are you sure you want to completely delete this shift from the calendar?")) return;
    try {
      await fetch(`http://localhost:8080/api/shifts/${id}`, { method: 'DELETE' });
      setEditingShift(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card h-100 shadow-sm border-0 d-flex flex-column">
      <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3 flex-shrink-0">
        <span className="fw-bold">Weekly Calendar Board</span>
        
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-primary btn-sm px-3 fw-bold" onClick={handleReschedule}>
            <i className="bi bi-magic me-2"></i> Auto-Schedule
          </button>
        </div>
      </div>
      
      <div className="card-body p-3 flex-grow-1 overflow-auto" style={{ minHeight: '70vh' }}>
        {loading && shifts.length === 0 ? <div className="p-4 text-center text-muted">Loading calendar...</div> : (
          <Calendar
            localizer={localizer}
            events={shifts}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', minHeight: '600px' }}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            views={['month', 'week', 'day']}
            step={30}
            timeslots={2}
            showMultiDayTimes
            dayLayoutAlgorithm="no-overlap"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
          />
        )}
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

export default ShiftCalendar;
