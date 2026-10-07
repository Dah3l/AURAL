import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#131318',
          border: '1px solid #2A2A35',
          color: '#F5F5F7',
          fontSize: '14px',
        },
      }}
    />
  </React.StrictMode>
);
