// ENVIRONMENT & DEPENDENCIES
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

// MIDDLEWARE CONFIGURATION
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// TEMPLATE ENGINE CONFIGURATION
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// INDEX RENDER
app.get("/", (req, res) => {
  res.render("index");
});

/*
// UNCOMMENT THIS FOR TESTING PURPOSE
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    WEATHER SERVER SUCCESSFULLY STARTED AT PORT ${PORT}
    `)
});
*/

// ❌ DO NOT LISTEN ON A PORT (Vercel handles this)
module.exports = app;