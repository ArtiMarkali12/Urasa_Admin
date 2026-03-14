import { useState, useEffect } from "react";
import { bookletAPI } from "../../services/api";
import "./Booklet.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Booklets = () => {
  const [booklets, setBooklets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooklet, setSelectedBooklet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBooklets();
  }, []);

  const fetchBooklets = async () => {
    try {
      const response = await bookletAPI.getAll();
      setBooklets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching booklets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booklet quote?")) {
      try {
        await bookletAPI.delete(id);
        setBooklets(booklets.filter((b) => b._id !== id));
      } catch (error) {
        console.error("Error deleting booklet:", error);
      }
    }
  };

  const handleView = (booklet) => {
    setSelectedBooklet(booklet);
    setShowModal(true);
  };

  const filteredBooklets = booklets.filter(
    (booklet) =>
      booklet.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booklet.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="booklets-page">
      <div className="page-header">
        <div>
          <h1>📚 Booklet Quotes</h1>
          <p>Manage all booklet quotation requests</p>
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
          <p>Loading booklets...</p>
        </div>
      ) : (
        <div className="booklets-grid">
          {filteredBooklets.length > 0 ? (
            filteredBooklets.map((booklet) => (
              <div key={booklet._id} className="booklet-card">
                <div className="booklet-header">
                  <div className="booklet-id">#{booklet._id.slice(-6)}</div>
                  <div className="booklet-date">
                    {formatDate(booklet.createdAt)}
                  </div>
                </div>

                <div className="booklet-body">
                  <div className="customer-info">
                    <h3>{booklet.customerDetails?.name}</h3>
                    <p>{booklet.customerDetails?.email}</p>
                    <p>{booklet.customerDetails?.phone}</p>
                  </div>

                  <div className="booklet-details">
                    <div className="detail-item">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{booklet.quantity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{booklet.bookSize}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Orientation:</span>
                      <span className="detail-value">
                        {booklet.orientation}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pages:</span>
                      <span className="detail-value">
                        {booklet.interiorSpecifications?.numberOfPages || "N/A"}
                      </span>
                    </div>
                  </div>

                  {booklet.files && booklet.files.length > 0 && (
                    <div className="booklet-files">
                      <span>📎 {booklet.files.length} file(s) attached</span>
                    </div>
                  )}
                </div>

                <div className="booklet-actions">
                  <button
                    className="btn-view"
                    onClick={() => handleView(booklet)}
                  >
                    👁️ View Details
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(booklet._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <span className="no-data-icon">📚</span>
              <p>No booklet quotes found</p>
            </div>
          )}
        </div>
      )}

      {showModal && selectedBooklet && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h2>Booklet Quote Details</h2>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div>
                    <strong>Name:</strong>{" "}
                    {selectedBooklet.customerDetails?.name}
                  </div>
                  <div>
                    <strong>Email:</strong>{" "}
                    {selectedBooklet.customerDetails?.email}
                  </div>
                  <div>
                    <strong>Phone:</strong>{" "}
                    {selectedBooklet.customerDetails?.phone}
                  </div>
                  <div>
                    <strong>Address:</strong>{" "}
                    {selectedBooklet.customerDetails?.address || "N/A"}
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Booklet Specifications</h3>
                <div className="info-grid">
                  <div>
                    <strong>Quantity:</strong> {selectedBooklet.quantity}
                  </div>
                  <div>
                    <strong>Size:</strong> {selectedBooklet.bookSize}
                  </div>
                  <div>
                    <strong>Orientation:</strong> {selectedBooklet.orientation}
                  </div>
                  <div>
                    <strong>Binding:</strong>{" "}
                    {selectedBooklet.bindingStyle?.bindingType || "N/A"}
                  </div>
                  <div>
                    <strong>Cover Style:</strong>{" "}
                    {selectedBooklet.bindingStyle?.coverStyle || "N/A"}
                  </div>
                  <div>
                    <strong>Pages:</strong>{" "}
                    {selectedBooklet.interiorSpecifications?.numberOfPages ||
                      "N/A"}
                  </div>
                  <div>
                    <strong>Print Color:</strong>{" "}
                    {selectedBooklet.interiorSpecifications?.printColor ||
                      "N/A"}
                  </div>
                  <div>
                    <strong>Paper Weight:</strong>{" "}
                    {selectedBooklet.interiorSpecifications?.paperWeight ||
                      "N/A"}
                  </div>
                  <div>
                    <strong>Cover Finish:</strong>{" "}
                    {selectedBooklet.interiorSpecifications?.coverFinish ||
                      "N/A"}
                  </div>
                  <div>
                    <strong>Packaging:</strong>{" "}
                    {selectedBooklet.packaging || "N/A"}
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Timeline</h3>
                <div className="info-grid">
                  <div>
                    <strong>Order Date:</strong>{" "}
                    {formatDate(selectedBooklet.timeline?.orderDate)}
                  </div>
                  <div>
                    <strong>Expected Date:</strong>{" "}
                    {formatDate(selectedBooklet.timeline?.expectedDate)}
                  </div>
                  <div>
                    <strong>Delivery Date:</strong>{" "}
                    {formatDate(selectedBooklet.timeline?.deliveryDate)}
                  </div>
                </div>
              </div>

              {selectedBooklet.additionalNotes && (
                <div className="modal-section">
                  <h3>Additional Notes</h3>
                  <p>{selectedBooklet.additionalNotes}</p>
                </div>
              )}

              {selectedBooklet.files && selectedBooklet.files.length > 0 && (
                <div className="modal-section">
                  <h3>Attached Files</h3>
                  <div className="files-list">
                    {selectedBooklet.files.map((file, index) => (
                      <a
                        key={index}
                        href={`${API}/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📎 {file.split("/").pop()}
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
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default Booklets;
