import { useState } from 'react';
import UserList from './components/UserList';
import ShiftDashboard from './components/ShiftDashboard';
import ShiftCalendar from './components/ShiftCalendar';
import TaskManagement from './components/TaskManagement';
import Settings from './components/Settings';
import SwapManagement from './components/SwapManagement';
import AttritionDashboard from './components/AttritionDashboard';
import SuccessionPlanning from './components/SuccessionPlanning';

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('shifts');

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">
      <div className="row g-0 h-100">
        {/* Sidebar */}
        <div className="col-md-2 bg-white border-end min-vh-100 py-4 shadow-sm">
          <div className="px-4 mb-4">
            <h5 className="fw-bold text-primary mb-0">ShiftMaster</h5>
            <small className="text-muted">Admin Panel</small>
          </div>
          
          <ul className="nav nav-pills flex-column px-3">
            <li className="nav-item mb-2">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'tasks' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('tasks')}
              >
                <i className="bi bi-list-task me-2"></i> Task Needs (Auto)
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'calendar' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('calendar')}
              >
                <i className="bi bi-calendar-week me-2"></i> Calendar Board
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'shifts' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('shifts')}
              >
                <i className="bi bi-card-checklist me-2"></i> Shift Dashboard
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'users' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-2"></i> Team Members
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'swaps' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('swaps')}
              >
                <i className="bi bi-arrow-left-right me-2"></i> Swap Requests
              </button>
            </li>
            
            <li className="nav-item mt-4 mb-2">
              <small className="text-muted fw-bold text-uppercase px-3">AI & Analytics</small>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'attrition' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('attrition')}
              >
                <i className="bi bi-activity text-danger me-2"></i> Attrition Risk
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'succession' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('succession')}
              >
                <i className="bi bi-diagram-3 text-primary me-2"></i> Succession Plan
              </button>
            </li>
            <li className="nav-item mt-4 pt-3 border-top">
              <button 
                className={`nav-link w-100 text-start ${activeTab === 'settings' ? 'active bg-dark text-white' : 'text-dark hover-bg-light'}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="bi bi-gear me-2"></i> Settings
              </button>
            </li>
            <li className="nav-item mt-2">
              <button className="nav-link w-100 text-start text-danger hover-bg-light" onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="col-md-10 bg-white">
          <div className="p-5">
            <main>
              {activeTab === 'tasks' && <TaskManagement />}
              {activeTab === 'calendar' && <ShiftCalendar />}
              {activeTab === 'shifts' && <ShiftDashboard />}
              {activeTab === 'users' && <UserList />}
              {activeTab === 'swaps' && <SwapManagement />}
              {activeTab === 'attrition' && <AttritionDashboard />}
              {activeTab === 'succession' && <SuccessionPlanning />}
              {activeTab === 'settings' && <Settings />}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
