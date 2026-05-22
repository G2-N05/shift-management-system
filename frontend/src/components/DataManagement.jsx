import { useState } from 'react';

function DataManagement() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleExport = () => {
    const token = localStorage.getItem('token');
    window.location.href = `http://localhost:8080/api/data/export/shifts?token=${token}`; // Assuming token can be passed in URL, or just trigger download.
    // A better way for authenticated download:
    fetch('http://localhost:8080/api/data/export/shifts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "shifts_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => console.error(err));
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/data/import/shifts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Do not set Content-Type for FormData
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully imported ${data.count} shifts!`);
        setFile(null);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-semibold text-primary"><i className="bi bi-cloud-arrow-down me-2"></i>Export Data</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">Export all historical and scheduled shifts to a CSV file for external reporting or backup purposes.</p>
            <button className="btn btn-outline-primary w-100 mt-3" onClick={handleExport}>
              <i className="bi bi-download me-2"></i> Download Shifts CSV
            </button>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 mb-4">
        <div className="card h-100 shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-semibold text-success"><i className="bi bi-cloud-arrow-up me-2"></i>Import Data</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">Upload a CSV file to bulk import shifts into the system. Ensure the file matches the standard export format.</p>
            
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            
            <form onSubmit={handleImport} className="mt-3">
              <div className="mb-3">
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".csv"
                  onChange={e => setFile(e.target.files[0])}
                />
              </div>
              <button type="submit" className="btn btn-success w-100" disabled={uploading || !file}>
                {uploading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-upload me-2"></i> Upload & Import</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataManagement;
