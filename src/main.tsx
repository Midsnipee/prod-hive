import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDatabase } from "./lib/initDB";

// Initialize database
initializeDatabase();

createRoot(document.getElementById("root")!).render(<App />);
