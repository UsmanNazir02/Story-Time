const express = require('express');
const http = require("http");  
const path = require('path');
const cors = require('cors')
const app = express();
require("dotenv").config();
const API = require('./api/Index');
const dbConnect = require('./config/dbConnect');
const cookieSession = require('cookie-session');
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use('/uploads', express.static('uploads'));
app.use(cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}));
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
dbConnect()
const server = http.createServer(app);
app.use(cors({ origin: "*", credentials: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Header", "Content-Type, Authorization");

  next();
});
app.get('/', (req, res) => res.json({ message: `Welcome to the ${process.env.APP_NAME}` }));
new API(app).registerGroups()
server.listen(PORT, HOST, () => console.log(`Server running at http://${HOST}:${PORT}/`));
