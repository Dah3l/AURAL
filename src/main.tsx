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
          background: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
        },
      }}
    />
  </React.StrictMode>
);
