import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

function startServer() {
  console.log("Starting server...");
  const app = express();
  console.log("Express app created");
  const PORT = 3000;
  console.log("PORT set to", PORT);

  app.use(express.json());

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

try {
  startServer();
} catch (error) {
  console.error("Error starting server:", error);
}