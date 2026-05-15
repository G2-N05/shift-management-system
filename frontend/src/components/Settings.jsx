import { useState, useEffect } from 'react';

function Settings() {
  const [minRestHours, setMinRestHours] = useState(11);
  const [standardShiftHours, setStandardShiftHours] = useState(4);
  const [fullShiftHours, setFullShiftHours] = useState(8);
  const [maxOvertimeHours, setMaxOvertimeHours] = useState(4);
  const [morningShiftStart, setMorningShiftStart] = useState('08:00');
  const [morningShiftEnd, setMorningShiftEnd] = useState('12:00');
  const [afternoonShiftStart, setAfternoonShiftStart] = useState('13:00');
  const [afternoonShiftEnd, setAfternoonShiftEnd] = useState('17:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/settings');
      const data = await res.json();
      if (data) {
        if (data.MinRestHours) setMinRestHours(data.MinRestHours);
        if (data.StandardShiftHours) setStandardShiftHours(data.StandardShiftHours);
        if (data.FullShiftHours) setFullShiftHours(data.FullShiftHours);
        if (data.MaxOvertimeHours) setMaxOvertimeHours(data.MaxOvertimeHours);
        if (data.MorningShiftStart) setMorningShiftStart(data.MorningShiftStart);
        if (data.MorningShiftEnd) setMorningShiftEnd(data.MorningShiftEnd);
        if (data.AfternoonShiftStart) setAfternoonShiftStart(data.AfternoonShiftStart);
        if (data.AfternoonShiftEnd) setAfternoonShiftEnd(data.AfternoonShiftEnd);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch('http://localhost:8080/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MinRestHours: parseFloat(minRestHours),
          StandardShiftHours: parseFloat(standardShiftHours),
          FullShiftHours: parseFloat(fullShiftHours),
          MaxOvertimeHours: parseFloat(maxOvertimeHours),
          MorningShiftStart: morningShiftStart,
          MorningShiftEnd: morningShiftEnd,
          AfternoonShiftStart: afternoonShiftStart,
          AfternoonShiftEnd: afternoonShiftEnd
        })
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading settings...</div>;

  return (
    <div className="row">
      <div className="col-md-8 offset-md-2">
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white fw-bold py-3">
            <i className="bi bi-gear-fill me-2 text-primary"></i>
            System Configuration
          </div>
          <div className="card-body">
            <form onSubmit={handleSave}>
              <h5 className="mb-3 text-secondary border-bottom pb-2">Shift Durations</h5>
              
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label fw-medium">Standard Shift (Hours)</label>
                  <input 
                    type="number" 
                    className="form-control text-center" 
                    value={standardShiftHours} 
                    onChange={(e) => setStandardShiftHours(e.target.value)}
                    min="1"
                    step="0.5"
                    required 
                  />
                  <div className="form-text">Example: 4 hours (1 ca)</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Full Shift (Hours)</label>
                  <input 
                    type="number" 
                    className="form-control text-center" 
                    value={fullShiftHours} 
                    onChange={(e) => setFullShiftHours(e.target.value)}
                    min="1"
                    step="0.5"
                    required 
                  />
                  <div className="form-text">Example: 8 hours (2 ca)</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Max Overtime (Hours)</label>
                  <input 
                    type="number" 
                    className="form-control text-center" 
                    value={maxOvertimeHours} 
                    onChange={(e) => setMaxOvertimeHours(e.target.value)}
                    min="0"
                    step="0.5"
                    required 
                  />
                  <div className="form-text">Tăng ca tối đa</div>
                </div>
              </div>

              <h5 className="mb-3 text-secondary border-bottom pb-2">Shift Time Windows</h5>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium text-primary">Morning Shift (Ca sáng)</label>
                  <div className="d-flex align-items-center gap-2">
                    <input 
                      type="time" 
                      className="form-control" 
                      value={morningShiftStart} 
                      onChange={(e) => setMorningShiftStart(e.target.value)}
                      required 
                    />
                    <span>to</span>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={morningShiftEnd} 
                      onChange={(e) => setMorningShiftEnd(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-warning">Afternoon Shift (Ca chiều)</label>
                  <div className="d-flex align-items-center gap-2">
                    <input 
                      type="time" 
                      className="form-control" 
                      value={afternoonShiftStart} 
                      onChange={(e) => setAfternoonShiftStart(e.target.value)}
                      required 
                    />
                    <span>to</span>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={afternoonShiftEnd} 
                      onChange={(e) => setAfternoonShiftEnd(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </div>

              <h5 className="mb-3 text-secondary border-bottom pb-2">Compliance & Rest</h5>

              <div className="mb-4">
                <label className="form-label fw-medium">Minimum Rest Between Shifts</label>
                <div className="input-group w-50">
                  <input 
                    type="number" 
                    className="form-control text-center" 
                    value={minRestHours} 
                    onChange={(e) => setMinRestHours(e.target.value)}
                    min="0"
                    step="0.5"
                    required 
                  />
                  <span className="input-group-text">Hours</span>
                </div>
                <div className="form-text mt-1">
                  The Rule Engine will reject scheduling requests that violate this.
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary px-5" disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</>
                  ) : (
                    <><i className="bi bi-save me-2"></i>Save Settings</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
