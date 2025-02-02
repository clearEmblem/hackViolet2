// api/index.js (or api/server.js)
const express = require("express");
const path = require("path");

const app = express();

// Set Content-Security-Policy header
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline';");
  next();
});

// Set the view engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));  // Assuming your views are inside 'public/views'

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

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

app.get("/results", (req, res) => {
  res.render("results");
});

// Export the app as a serverless function for Vercel
module.exports = (req, res) => {
  app(req, res);  // Let Express handle the request/response
};
