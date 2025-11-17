import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedDemoUsers } from "./lib/seedDemoUsers";

// Seed demo users on first load
seedDemoUsers();

createRoot(document.getElementById("root")!).render(<App />);
