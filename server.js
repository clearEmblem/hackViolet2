const express = require("express");
const app = express();
const path = require("path");

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src'self' 'unsafe-inline';");
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

app.use(express.static(path.join(__dirname, "public")));

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


app.listen(3001, () => {
  console.log("server is running on port 3000");
});
