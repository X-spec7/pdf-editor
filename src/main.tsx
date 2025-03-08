import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import PDF.js configuration
import "@/lib/pdf-config";

createRoot(document.getElementById("root")!).render(<App />);
