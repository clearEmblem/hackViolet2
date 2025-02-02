const express = require("express");
// gpt
const path = require("path");
const app = express();
//gpt
app.set("views", path.join(__dirname, "views"));
//gpt
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index");
};

//app.listen(3000, () => console.log("Server ready on port 3000."));
module.exports = (req, res) => {
  app(req, res); // Vercel invokes this when handling a request
};
//module.exports = app;
