import { useState, useEffect } from "react";
import { bookletAPI, bookletOptionsAPI } from "../../services/api";
import "./Booklet.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Booklets = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [activeOptionsTab, setActiveOptionsTab] = useState("bookSizes");

  // Quotes State
  const [booklets, setBooklets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooklet, setSelectedBooklet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({});

  // Options State
  const [options, setOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [editingOption, setEditingOption] = useState(null);
  const [editOptionValue, setEditOptionValue] = useState("");

  // Category Management State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDisplay, setNewCategoryDisplay] = useState("");

  // Toast/Success Message State
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (activeTab === "quotes") {
      fetchBooklets();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // ==================== QUOTES FUNCTIONS ====================

  const fetchBooklets = async () => {
    try {
      const response = await bookletAPI.getAll();
      setBooklets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching booklets:", error);
      showToast("Failed to fetch booklet quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booklet quote?")) {
      try {
        await bookletAPI.delete(id);
        setBooklets(booklets.filter((b) => b._id !== id));
        showToast("Booklet quote deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting booklet:", error);
        showToast("Failed to delete booklet quote", "error");
      }
    }
  };

  const handleView = (booklet) => {
    setSelectedBooklet(booklet);
    setShowModal(true);
  };

  const handleEdit = (booklet) => {
    setFormData({
      quantity: booklet.quantity || "",
      bookSize: booklet.bookSize || "",
      orientation: booklet.orientation || "",
      bindingType: booklet.bindingStyle?.bindingType || "",
      coverStyle: booklet.bindingStyle?.coverStyle || "",
      coverFlaps: booklet.bindingStyle?.coverFlaps || false,
      numberOfPages: booklet.interiorSpecifications?.numberOfPages || "",
      printColor: booklet.interiorSpecifications?.printColor || "",
      paperWeight: booklet.interiorSpecifications?.paperWeight || "",
      paperType: booklet.interiorSpecifications?.paperType || "",
      coverFinish: booklet.interiorSpecifications?.coverFinish || "",
      packaging: booklet.packaging || "",
      additionalNotes: booklet.additionalNotes || "",
      expectedDate: booklet.timeline?.expectedDate
        ? new Date(booklet.timeline.expectedDate).toISOString().split("T")[0]
        : "",
      deliveryDate: booklet.timeline?.deliveryDate
        ? new Date(booklet.timeline.deliveryDate).toISOString().split("T")[0]
        : "",
    });
    setSelectedBooklet(booklet);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        quantity: formData.quantity,
        bookSize: formData.bookSize,
        orientation: formData.orientation,
        bindingStyle: {
          bindingType: formData.bindingType,
          coverStyle: formData.coverStyle,
          coverFlaps: formData.coverFlaps,
        },
        interiorSpecifications: {
          numberOfPages: formData.numberOfPages
            ? parseInt(formData.numberOfPages)
            : undefined,
          printColor: formData.printColor,
          paperWeight: formData.paperWeight,
          paperType: formData.paperType,
          coverFinish: formData.coverFinish,
        },
        packaging: formData.packaging,
        additionalNotes: formData.additionalNotes,
        timeline: {
          expectedDate: formData.expectedDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      };

      await bookletAPI.update(selectedBooklet._id, updateData);
      fetchBooklets();
      setShowEditModal(false);
      setSelectedBooklet(null);
      showToast("Booklet quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating booklet:", error);
      showToast("Failed to update booklet quote", "error");
    }
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

  // ==================== OPTIONS FUNCTIONS ====================

  const fetchOptions = async () => {
    try {
      const response = await bookletOptionsAPI.getAll();
      setOptions(response.data.data || {});
    } catch (error) {
      console.error("Error fetching options:", error);
      showToast("Failed to fetch options", "error");
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newOptionValue.trim()) return;

    try {
      const apiFunction = getOptionApiFunction("add");
      const response = await apiFunction({ value: newOptionValue });
      setNewOptionValue("");
      fetchOptions();

      const message =
        response?.data?.message || `${activeOptionsTab} added successfully`;
      showToast(message, "success");
    } catch (error) {
      console.error("Error adding option:", error);
      showToast(
        error.response?.data?.message || "Error adding option",
        "error",
      );
    }
  };

  const handleEditOption = (value) => {
    setEditingOption(activeOptionsTab);
    setEditOptionValue(value);
  };

  const handleUpdateOption = async (e) => {
    e.preventDefault();
    if (!editOptionValue.trim()) return;

    try {
      const currentValue = options[activeOptionsTab];
      const index = currentValue.indexOf(editOptionValue);
      const apiFunction = getOptionApiFunction("update");
      const response = await apiFunction(index, { value: editOptionValue });
      setEditingOption(null);
      fetchOptions();

      const message =
        response?.data?.message || `${activeOptionsTab} updated successfully`;
      showToast(message, "success");
    } catch (error) {
      console.error("Error updating option:", error);
      showToast(
        error.response?.data?.message || "Error updating option",
        "error",
      );
    }
  };

  const handleDeleteOption = async (value) => {
    if (!window.confirm(`Are you sure you want to delete "${value}"?`)) return;

    try {
      const currentValue = options[activeOptionsTab];
      const index = currentValue.indexOf(value);
      const apiFunction = getOptionApiFunction("delete");
      const response = await apiFunction(index);
      fetchOptions();

      const message =
        response?.data?.message || `${activeOptionsTab} deleted successfully`;
      showToast(message, "success");
    } catch (error) {
      console.error("Error deleting option:", error);
      showToast(
        error.response?.data?.message || "Error deleting option",
        "error",
      );
    }
  };

  const getOptionApiFunction = (action) => {
    const apiMap = {
      bookSizes: {
        add: bookletOptionsAPI.addBookSize,
        update: bookletOptionsAPI.updateBookSize,
        delete: bookletOptionsAPI.deleteBookSize,
      },
      bindingTypes: {
        add: bookletOptionsAPI.addBindingType,
        update: bookletOptionsAPI.updateBindingType,
        delete: bookletOptionsAPI.deleteBindingType,
      },
      coverStyles: {
        add: bookletOptionsAPI.addCoverStyle,
      },
      printColors: {
        add: bookletOptionsAPI.addPrintColor,
      },
      paperWeights: {
        add: bookletOptionsAPI.addPaperWeight,
      },
      paperTypes: {
        add: bookletOptionsAPI.addPaperType,
        update: bookletOptionsAPI.updatePaperType,
        delete: bookletOptionsAPI.deletePaperType,
      },
      coverFinishes: {
        add: bookletOptionsAPI.addCoverFinish,
        update: bookletOptionsAPI.updateCoverFinish,
        delete: bookletOptionsAPI.deleteCoverFinish,
      },
      pageEdges: {
        add: bookletOptionsAPI.addPageEdge,
        update: bookletOptionsAPI.updatePageEdge,
        delete: bookletOptionsAPI.deletePageEdge,
      },
      packaging: {
        add: bookletOptionsAPI.addPackaging,
      },
      specialFinishing: {
        add: bookletOptionsAPI.addSpecialFinishing,
      },
    };

    return apiMap[activeOptionsTab]?.[action] || null;
  };

  // ==================== CATEGORY MANAGEMENT FUNCTIONS ====================

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    const validNameRegex = /^[a-z][a-zA-Z0-9]*$/;
    if (!validNameRegex.test(newCategoryName)) {
      showToast(
        "Category name must start with lowercase letter and contain only letters/numbers",
        "error",
      );
      return;
    }

    try {
      const response = await bookletOptionsAPI.addCategory({
        categoryName: newCategoryName,
        displayName: newCategoryDisplay || newCategoryName,
      });

      setNewCategoryName("");
      setNewCategoryDisplay("");
      setShowAddCategory(false);
      fetchOptions();

      const message =
        response?.data?.message ||
        `Category "${newCategoryName}" added successfully`;
      showToast(message, "success");
    } catch (error) {
      console.error("Error adding category:", error);
      showToast(
        error.response?.data?.message || "Error adding category",
        "error",
      );
    }
  };

  const handleDeleteCategory = async (categoryId, categoryLabel) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the "${categoryLabel}" category? This will remove all values in this category.`,
      )
    )
      return;

    try {
      const response = await bookletOptionsAPI.deleteCategory({
        categoryName: categoryId,
      });

      if (activeOptionsTab === categoryId) {
        const remainingTabs = optionsTabs.filter((t) => t.id !== categoryId);
        if (remainingTabs.length > 0) {
          setActiveOptionsTab(remainingTabs[0].id);
        }
      }

      fetchOptions();

      const message =
        response?.data?.message ||
        `Category "${categoryLabel}" deleted successfully`;
      showToast(message, "success");
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast(
        error.response?.data?.message || "Error deleting category",
        "error",
      );
    }
  };

  // Format label for display
  const formatLabel = (id) => {
    let result = "";
    for (let i = 0; i < id.length; i++) {
      const char = id[i];
      if (char === char.toUpperCase() && char !== char.toLowerCase() && i > 0) {
        result += " ";
      }
      result += char;
    }
    return result.trim().toLowerCase();
  };

  // Default icons for categories
  const categoryIcons = {
    bookSizes: "📏",
    bindingTypes: "📎",
    coverStyles: "🎨",
    printColors: "🌈",
    paperWeights: "⚖️",
    paperTypes: "📄",
    coverFinishes: "✨",
    pageEdges: "📑",
    packaging: "📦",
    specialFinishing: "🌟",
  };

  // Dynamic options tabs from backend
  const optionsTabs = options
    ? Object.keys(options).map((key) => ({
        id: key,
        label: formatLabel(key),
        icon: categoryIcons[key] || "📁",
      }))
    : [];

  const currentOptions = options?.[activeOptionsTab] || [];

  return (
    <div className="booklets-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast({ ...toast, show: false })}
          >
            ×
          </button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>
            <span className="page-icon">📚</span> Booklet Management
          </h1>
          <p>Manage quotes and configuration options</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="main-tabs">
        <button
          className={`main-tab ${activeTab === "quotes" ? "active" : ""}`}
          onClick={() => setActiveTab("quotes")}
        >
          <span className="tab-icon">📋</span> Quotes
        </button>
        <button
          className={`main-tab ${activeTab === "options" ? "active" : ""}`}
          onClick={() => setActiveTab("options")}
        >
          <span className="tab-icon">⚙️</span> Manage Options
        </button>
        <button
          className={`main-tab ${activeTab === "viewOptions" ? "active" : ""}`}
          onClick={() => setActiveTab("viewOptions")}
        >
          <span className="tab-icon">👁️</span> View Options
        </button>
      </div>

      {/* QUOTES TAB */}
      {activeTab === "quotes" && (
        <div className="tab-content">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading booklet quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredBooklets.length > 0 ? (
                filteredBooklets.map((booklet) => (
                  <div key={booklet._id} className="booklet-card">
                    <div className="card-badge">
                      #{booklet._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {booklet.customerDetails?.name?.charAt(0) || "C"}
                      </div>
                      <div className="customer-name">
                        {booklet.customerDetails?.name}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">📧 Email</span>
                        <span className="info-value">
                          {booklet.customerDetails?.email}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📱 Phone</span>
                        <span className="info-value">
                          {booklet.customerDetails?.phone}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📊 Quantity</span>
                        <span className="info-value">{booklet.quantity}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📏 Size</span>
                        <span className="info-value">{booklet.bookSize}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📄 Pages</span>
                        <span className="info-value">
                          {booklet.interiorSpecifications?.numberOfPages ||
                            "N/A"}
                        </span>
                      </div>
                      {booklet.files && booklet.files.length > 0 && (
                        <div className="files-badge">
                          📎 {booklet.files.length} file(s)
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(booklet.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(booklet)}
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(booklet)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(booklet._id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <p>No booklet quotes found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MANAGE OPTIONS TAB - Two Column Layout */}
      {activeTab === "options" && (
        <div className="tab-content">
          <div className="manage-options-header">
            <h2>Manage Configuration Options</h2>
            <button
              className="add-category-top-btn"
              onClick={() => setShowAddCategory(true)}
              title="Add New Category"
            >
              ➕ Add Category
            </button>
          </div>

          <div className="manage-options-layout">
            {/* Left Side - Category Tabs */}
            <div className="options-tabs-container">
              <div className="options-tabs">
                {optionsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`option-tab ${
                      activeOptionsTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveOptionsTab(tab.id)}
                  >
                    <span className="option-tab-icon">{tab.icon}</span>
                    <span className="option-tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Option Values Content */}
            <div className="options-values-container">
              <div className="options-values-header">
                <h2>
                  {optionsTabs.find((t) => t.id === activeOptionsTab)?.icon}{" "}
                  {optionsTabs.find((t) => t.id === activeOptionsTab)?.label}
                </h2>
                <div className="options-values-actions">
                  <span className="options-count">{currentOptions.length}</span>
                  <button
                    className="delete-category-btn"
                    onClick={() =>
                      handleDeleteCategory(
                        activeOptionsTab,
                        optionsTabs.find((t) => t.id === activeOptionsTab)
                          ?.label,
                      )
                    }
                    title="Delete Category"
                  >
                    🗑️ Delete Category
                  </button>
                </div>
              </div>

              {optionsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading options...</p>
                </div>
              ) : (
                <>
                  <form className="add-option-form" onSubmit={handleAddOption}>
                    <input
                      type="text"
                      placeholder={`Add new ${formatLabel(activeOptionsTab)}...`}
                      value={newOptionValue}
                      onChange={(e) => setNewOptionValue(e.target.value)}
                      className="option-input"
                    />
                    <button type="submit" className="add-btn">
                      ➕ Add
                    </button>
                  </form>

                  <div className="options-list">
                    {currentOptions.length > 0 ? (
                      currentOptions.map((value, index) => (
                        <div key={index} className="option-item">
                          {editingOption === activeOptionsTab &&
                          editOptionValue === value ? (
                            <form
                              className="edit-option-form"
                              onSubmit={handleUpdateOption}
                            >
                              <input
                                type="text"
                                value={editOptionValue}
                                onChange={(e) =>
                                  setEditOptionValue(e.target.value)
                                }
                                className="option-input edit"
                                autoFocus
                              />
                              <button type="submit" className="action-btn save">
                                💾
                              </button>
                              <button
                                type="button"
                                className="action-btn cancel"
                                onClick={() => setEditingOption(null)}
                              >
                                ❌
                              </button>
                            </form>
                          ) : (
                            <>
                              <span className="option-text">{value}</span>
                              <div className="option-actions">
                                <button
                                  className="action-btn small edit"
                                  onClick={() => handleEditOption(value)}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn small delete"
                                  onClick={() => handleDeleteOption(value)}
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state small">
                        <div className="empty-icon">📭</div>
                        <p>No options available</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW OPTIONS TAB */}
      {activeTab === "viewOptions" && (
        <div className="tab-content">
          <div className="view-options-header">
            <div>
              <h2>All Configuration Options</h2>
              <p>View and manage all booklet configuration options</p>
            </div>
          </div>

          {optionsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading all options...</p>
            </div>
          ) : (
            <div className="all-options-grid">
              {optionsTabs.map((tab) => {
                const optionValues = options?.[tab.id] || [];
                return (
                  <div key={tab.id} className="option-category-card">
                    <div className="category-header">
                      <h3>{tab.label}</h3>
                      <span className="category-count">
                        {optionValues.length}
                      </span>
                    </div>

                    {optionValues.length > 0 ? (
                      <div className="category-options-list">
                        {optionValues.map((value, index) => (
                          <div key={index} className="category-option-item">
                            <span className="category-option-text">
                              {value}
                            </span>
                            <button
                              className="category-delete-btn"
                              onClick={() => {
                                setActiveOptionsTab(tab.id);
                                handleDeleteOption(value);
                              }}
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="category-empty">
                        <p>No options available</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategory && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddCategory(false)}
        >
          <div
            className="modal-content add-category-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowAddCategory(false)}
            >
              ×
            </button>
            <div className="modal-header">
              <h2>Add New Category</h2>
            </div>

            <form className="add-category-form" onSubmit={handleAddCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name (camelCase)</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., paperTextures, foilColors"
                    required
                  />
                  <small className="form-hint">
                    Start with lowercase letter, no spaces or special characters
                  </small>
                </div>

                <div className="form-group">
                  <label>Display Name (optional)</label>
                  <input
                    type="text"
                    value={newCategoryDisplay}
                    onChange={(e) => setNewCategoryDisplay(e.target.value)}
                    placeholder="e.g., Paper Textures"
                  />
                  <small className="form-hint">
                    Leave empty to auto-generate from category name
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddCategory(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  ➕ Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showModal && selectedBooklet && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <div className="modal-header">
              <h2>Booklet Quote Details</h2>
              <div className="modal-id">
                #{selectedBooklet._id.slice(-6).toUpperCase()}
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <div className="section-icon">👤</div>
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Name</span>
                    <span className="value">
                      {selectedBooklet.customerDetails?.name}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">
                      {selectedBooklet.customerDetails?.email}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">
                      {selectedBooklet.customerDetails?.phone}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Address</span>
                    <span className="value">
                      {selectedBooklet.customerDetails?.address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="section-icon">📚</div>
                <h3>Booklet Specifications</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Quantity</span>
                    <span className="value">{selectedBooklet.quantity}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Size</span>
                    <span className="value">{selectedBooklet.bookSize}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Orientation</span>
                    <span className="value">
                      {selectedBooklet.orientation || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Binding Type</span>
                    <span className="value">
                      {selectedBooklet.bindingStyle?.bindingType || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Cover Style</span>
                    <span className="value">
                      {selectedBooklet.bindingStyle?.coverStyle || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Cover Flaps</span>
                    <span className="value">
                      {selectedBooklet.bindingStyle?.coverFlaps ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Pages</span>
                    <span className="value">
                      {selectedBooklet.interiorSpecifications?.numberOfPages ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Print Color</span>
                    <span className="value">
                      {selectedBooklet.interiorSpecifications?.printColor ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Paper Weight</span>
                    <span className="value">
                      {selectedBooklet.interiorSpecifications?.paperWeight ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Paper Type</span>
                    <span className="value">
                      {selectedBooklet.interiorSpecifications?.paperType ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Cover Finish</span>
                    <span className="value">
                      {selectedBooklet.interiorSpecifications?.coverFinish ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Packaging</span>
                    <span className="value">
                      {selectedBooklet.packaging || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="section-icon">📅</div>
                <h3>Timeline</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Order Date</span>
                    <span className="value">
                      {formatDate(selectedBooklet.timeline?.orderDate)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Expected Date</span>
                    <span className="value">
                      {formatDate(selectedBooklet.timeline?.expectedDate)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Delivery Date</span>
                    <span className="value">
                      {formatDate(selectedBooklet.timeline?.deliveryDate)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooklet.additionalNotes && (
                <div className="modal-section">
                  <div className="section-icon">📝</div>
                  <h3>Additional Notes</h3>
                  <p className="notes-text">
                    {selectedBooklet.additionalNotes}
                  </p>
                </div>
              )}

              {selectedBooklet.files && selectedBooklet.files.length > 0 && (
                <div className="modal-section">
                  <div className="section-icon">📎</div>
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
                        <span className="file-icon">📄</span>
                        <span className="file-name">
                          {file.split("/").pop()}
                        </span>
                        <span className="file-open">🔗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedBooklet && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowEditModal(false)}
            >
              ×
            </button>
            <div className="modal-header">
              <h2>Edit Booklet Quote</h2>
              <div className="modal-id">
                #{selectedBooklet._id.slice(-6).toUpperCase()}
              </div>
            </div>

            <form className="edit-form" onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-section">
                  <div className="section-icon">📊</div>
                  <h3>Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="text"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Book Size</label>
                      <input
                        type="text"
                        value={formData.bookSize}
                        onChange={(e) =>
                          setFormData({ ...formData, bookSize: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Orientation</label>
                      <select
                        value={formData.orientation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            orientation: e.target.value,
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="section-icon">📚</div>
                  <h3>Binding Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Binding Type</label>
                      <input
                        type="text"
                        value={formData.bindingType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bindingType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Cover Style</label>
                      <input
                        type="text"
                        value={formData.coverStyle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coverStyle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.coverFlaps}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coverFlaps: e.target.checked,
                            })
                          }
                        />
                        Cover Flaps
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="section-icon">📄</div>
                  <h3>Interior Specifications</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Pages</label>
                      <input
                        type="number"
                        value={formData.numberOfPages}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfPages: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Print Color</label>
                      <input
                        type="text"
                        value={formData.printColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            printColor: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Paper Weight</label>
                      <input
                        type="text"
                        value={formData.paperWeight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperWeight: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Paper Type</label>
                      <input
                        type="text"
                        value={formData.paperType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Cover Finish</label>
                      <input
                        type="text"
                        value={formData.coverFinish}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coverFinish: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="section-icon">📦</div>
                  <h3>Packaging & Notes</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Packaging</label>
                      <input
                        type="text"
                        value={formData.packaging}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packaging: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Additional Notes</label>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalNotes: e.target.value,
                          })
                        }
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="section-icon">📅</div>
                  <h3>Timeline</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Expected Date</label>
                      <input
                        type="date"
                        value={formData.expectedDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expectedDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Delivery Date</label>
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  💾 Save Changes
                </button>
              </div>
            </form>
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
