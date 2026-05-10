const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const AuthRouter = require("./Routes/AuthRouter");
const path = require('path');
require("dotenv").config();
require("./Models/db");
require("./Models/Task");
require("./Models/TaskAssignment");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ✅ MIDDLEWARE SETUP (correct order)
app.use(bodyParser.json());

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // or just '*' to allow all origins (use carefully)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Customize as per your needs
  credentials: true, // Allow cookies or credentials if needed
}));



app.use(
  session({
    secret: 'your-secret-key',         // 🔐 Replace with strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
  })
);




// ✅ Routes after session middleware
app.use('/auth', AuthRouter);

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
