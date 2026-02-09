import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

// Load ENV dari .env
dotenv.config();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL),
  },
});
