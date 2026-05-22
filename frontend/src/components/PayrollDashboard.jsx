import { useState, useEffect } from 'react';

function PayrollDashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [usersRes, payrollRes] = await Promise.all([
        fetch('http://localhost:8080/api/users', { headers }),
        fetch(`http://localhost:8080/api/payroll?month=${month}&year=${year}`, { headers })
      ]);
      const usersData = await usersRes.json();
      const payrollData = await payrollRes.json();
      
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(payrollData)) setRecords(payrollData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/payroll/calculate?month=${month}&year=${year}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setRecords(data);
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

  const totalPayroll = records.reduce((sum, r) => sum + r.TotalPay, 0);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold text-primary">Monthly Payroll</h5>
        <div className="d-flex gap-2 align-items-center">
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
          <button className="btn btn-sm btn-primary ms-2" onClick={handleGeneratePayroll} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-calculator me-1"></i> Generate Payroll</>}
          </button>
        </div>
      </div>
      
      <div className="card-body p-0">
        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Payroll records are calculated based on <strong className="text-dark">Actual Clock-In/Out hours</strong> (falling back to scheduled hours if missing) <br/> multiplied by the <strong>Base Hourly Rate</strong> and <strong>KPI Bonus Multiplier</strong>.
          </div>
          <div className="text-end">
            <span className="text-muted small d-block">Total Estimated Payroll</span>
            <h3 className="text-primary mb-0">${totalPayroll.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4">Employee</th>
                <th className="text-end">Total Hours</th>
                <th className="text-end">Base Rate</th>
                <th className="text-end">Base Pay</th>
                <th className="text-end">KPI Bonus</th>
                <th className="text-end px-4">Total Payout</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.ID}>
                  <td className="px-4 fw-medium">{getUserName(r.UserID)}</td>
                  <td className="text-end text-muted">{r.TotalHours.toFixed(1)}h</td>
                  <td className="text-end text-muted">${r.BaseRate.toFixed(2)}/h</td>
                  <td className="text-end text-muted">${r.BasePay.toFixed(2)}</td>
                  <td className="text-end text-success fw-medium">+ ${r.BonusPay.toFixed(2)}</td>
                  <td className="text-end px-4 fw-bold fs-6">${r.TotalPay.toFixed(2)}</td>
                </tr>
              ))}
              {records.length === 0 && !loading && (
                 <tr><td colSpan="6" className="text-center py-5 text-muted">No payroll data generated for this month. Click "Generate Payroll".</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PayrollDashboard;
