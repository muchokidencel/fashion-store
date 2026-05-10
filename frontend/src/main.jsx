import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";
import Toast from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <App />
          <Toast />
          <BackToTop />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);