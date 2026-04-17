import dotenv from "dotenv";

import app from "./app.js";
import connectDatabase from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
