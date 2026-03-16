import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Validate name (at least 2 characters)
  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when user starts typing
    setError("");
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...validationErrors };

    // Validate on blur
    if (name === "name") {
      if (!value.trim()) {
        newErrors.name = "Full name is required";
      } else if (!validateName(value)) {
        newErrors.name = "Name must be at least 2 characters";
      } else {
        delete newErrors.name;
      }
    }

    if (name === "email") {
      if (!value) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(value)) {
        newErrors.email = "Please enter a valid email address";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(value)) {
        newErrors.password = "Password must be at least 6 characters";
      } else {
        delete newErrors.password;
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (value !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    // Client-side validation
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (!validateName(formData.name)) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password,
      );

      // Successful registration - redirect to dashboard
      if (response?.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      // Handle different error scenarios
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Registration failed. Please try again.",
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          "Registration failed. Please check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* LEFT */}
        <div className="reg-left">
          <div className="streak s1" />
          <div className="streak s2" />
          <div className="streak s3" />
          <div className="streak s4" />
          <div className="streak s5" />
          <div className="streak s6" />

          <div className="reg-logo">
            <div className="logo-dot">
              <span />
            </div>
            <span className="logo-text">Your Logo</span>
          </div>

          <div className="reg-body">
            <h1>
              Hello,
              <br />
              welcome!
            </h1>
            <p>
              Lorem ipsum dolor sit amet,
              <br />
              consectetur adipiscing elit. Phasellus nisi risus.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="reg-right">
          {error && (
            <div className="error-msg">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <div className="input-label">Full Name</div>
              <div className="input-wrap">
                <div className="input-bar" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Full Name"
                  disabled={loading}
                  className={validationErrors.name ? "input-error" : ""}
                />
              </div>
              {validationErrors.name && (
                <span className="field-error">{validationErrors.name}</span>
              )}
            </div>

            <div className="input-group">
              <div className="input-label">Email address</div>
              <div className="input-wrap">
                <div className="input-bar" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Email"
                  disabled={loading}
                  className={validationErrors.email ? "input-error" : ""}
                />
              </div>
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="input-group">
              <div className="input-label">Password</div>
              <div className="input-wrap">
                <div className="input-bar" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a password"
                  disabled={loading}
                  className={validationErrors.password ? "input-error" : ""}
                />
              </div>
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>

            <div className="input-group">
              <div className="input-label">Confirm Password</div>
              <div className="input-wrap">
                <div className="input-bar" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  disabled={loading}
                  className={
                    validationErrors.confirmPassword ? "input-error" : ""
                  }
                />
              </div>
              {validationErrors.confirmPassword && (
                <span className="field-error">
                  {validationErrors.confirmPassword}
                </span>
              )}
            </div>

            <div className="row-opts">
              <label className="remember">
                <input type="checkbox" required disabled={loading} />
                <span>I agree to Terms & Conditions</span>
              </label>
              <Link to="/login" className="signin-link">
                Sign in here
              </Link>
            </div>

            <div className="divider">Already have an account?</div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
