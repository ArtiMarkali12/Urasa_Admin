import { useState, useEffect } from 'react';
import { notebookAPI } from '../../services/api';
import './Notebook.css';

const Notebooks = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await notebookAPI.getAll();
      setNotebooks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notebook quote?')) {
      try {
        await notebookAPI.delete(id);
        setNotebooks(notebooks.filter(b => b._id !== id));
      } catch (error) {
        console.error('Error deleting notebook:', error);
      }
    }
  };

  const handleView = (notebook) => {
    setSelectedNotebook(notebook);
    setShowModal(true);
  };

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notebook.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notebooks-page">
      <div className="page-header">
        <div>
          <h1>📓 Notebook Quotes</h1>
          <p>Manage all notebook quotation requests</p>
        </div>
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notebooks...</p>
        </div>
      ) : (
        <div className="notebooks-grid">
          {filteredNotebooks.length > 0 ? (
            filteredNotebooks.map((notebook) => (
              <div key={notebook._id} className="notebook-card">
                <div className="notebook-header">
                  <div className="notebook-id">#{notebook._id.slice(-6)}</div>
                  <div className="notebook-date">{formatDate(notebook.createdAt)}</div>
                </div>

                <div className="notebook-body">
                  <div className="customer-info">
                    <h3>{notebook.customerDetails?.name}</h3>
                    <p>{notebook.customerDetails?.email}</p>
                    <p>{notebook.customerDetails?.phone}</p>
                  </div>

                  <div className="notebook-details">
                    <div className="detail-item">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{notebook.quantity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{notebook.notebookDetails?.size}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Binding:</span>
                      <span className="detail-value">{notebook.notebookDetails?.bindingStyle || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pages:</span>
                      <span className="detail-value">{notebook.interiorPages?.numberOfPages || 'N/A'}</span>
                    </div>
                  </div>

                  {notebook.files && notebook.files.length > 0 && (
                    <div className="notebook-files">
                      <span>📎 {notebook.files.length} file(s) attached</span>
                    </div>
                  )}
                </div>

                <div className="notebook-actions">
                  <button className="btn-view" onClick={() => handleView(notebook)}>
                    👁️ View Details
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(notebook._id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <span className="no-data-icon">📓</span>
              <p>No notebook quotes found</p>
            </div>
          )}
        </div>
      )}

      {showModal && selectedNotebook && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2>Notebook Quote Details</h2>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div><strong>Name:</strong> {selectedNotebook.customerDetails?.name}</div>
                  <div><strong>Email:</strong> {selectedNotebook.customerDetails?.email}</div>
                  <div><strong>Phone:</strong> {selectedNotebook.customerDetails?.phone}</div>
                  <div><strong>Address:</strong> {selectedNotebook.customerDetails?.address || 'N/A'}</div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Notebook Specifications</h3>
                <div className="info-grid">
                  <div><strong>Quantity:</strong> {selectedNotebook.quantity}</div>
                  <div><strong>Size:</strong> {selectedNotebook.notebookDetails?.size}</div>
                  <div><strong>Binding:</strong> {selectedNotebook.notebookDetails?.bindingStyle || 'N/A'}</div>
                  <div><strong>Pages:</strong> {selectedNotebook.interiorPages?.numberOfPages || 'N/A'}</div>
                  <div><strong>Ruling:</strong> {selectedNotebook.interiorPages?.pageRuling || 'N/A'}</div>
                  <div><strong>Cover Type:</strong> {selectedNotebook.interiorPages?.coverTypes || 'N/A'}</div>
                  <div><strong>Cover Finish:</strong> {selectedNotebook.interiorPages?.coverFinish || 'N/A'}</div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Timeline</h3>
                <div className="info-grid">
                  <div><strong>Order Date:</strong> {formatDate(selectedNotebook.timeline?.orderDate)}</div>
                  <div><strong>Expected Date:</strong> {formatDate(selectedNotebook.timeline?.expectedDate)}</div>
                  <div><strong>Delivery Date:</strong> {formatDate(selectedNotebook.timeline?.deliveryDate)}</div>
                </div>
              </div>

              {selectedNotebook.notes?.additionalInstructions && (
                <div className="modal-section">
                  <h3>Additional Instructions</h3>
                  <p>{selectedNotebook.notes.additionalInstructions}</p>
                </div>
              )}

              {selectedNotebook.files && selectedNotebook.files.length > 0 && (
                <div className="modal-section">
                  <h3>Attached Files</h3>
                  <div className="files-list">
                    {selectedNotebook.files.map((file, index) => (
                      <a key={index} href={`http://localhost:5000/${file}`} target="_blank" rel="noopener noreferrer" className="file-link">
                        📎 {file.split('/').pop()}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default Notebooks;
