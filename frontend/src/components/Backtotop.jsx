import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "60vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "40px",
          fontFamily: "DM Sans, sans-serif", textAlign: "center"
        }}>
          <h2 style={{ fontSize: 32, marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: "#888", marginBottom: 24 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 32px", background: "#0a0a0a", color: "#fff",
              border: "none", cursor: "pointer", fontSize: 13,
              letterSpacing: "1.5px", textTransform: "uppercase"
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}