const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

// REGISTER MODELS
require("./models/User");
require("./models/Department");
require("./models/Bill");

const app = express();

// -------------------- CORS CONFIG --------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman, Curl, Mobile apps (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true); // Allowed
    } else {
      console.log("❌ CORS BLOCKED:", origin);
      return callback(new Error("CORS blocked: " + origin), false);
    }
  },
  credentials: true,
}));

// Body parser
app.use(express.json());

// -------------------- ROUTES --------------------
app.get("/", (req, res) => {
  res.send("Bill Management Backend Running");
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
// app.use("/api/setup", require("./routes/createAdmin")); // use only once

// -------------------- SERVER + SOCKET.IO --------------------
const PORT = process.env.PORT || 5000;

const http = require("http").createServer(app);
const socketUtil = require("./utils/socket");

// Pass allowedOrigins to Socket.IO
const io = socketUtil.init(http, allowedOrigins);

http.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// expose io globally
