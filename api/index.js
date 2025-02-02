const express = require('express');
const path = require('path');
const app = express();

// Set Content-Security-Policy header
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline';");
  next();
});

app.set("views", path.join(__dirname, "../public/views"));  // Adjust path if necessary
app.set("view engine", "ejs");  // Assuming you are using EJS

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Define routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/page2", (req, res) => {
  res.render("page2");
});

app.get("/page3", (req, res) => {
  res.render("page3");
});

app.get("/page4", (req, res) => {
  res.render("page4");
});

// Export the app as a serverless function for Vercel
module.exports = (req, res) => {
  app(req, res);
};