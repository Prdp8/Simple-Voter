const express = require("express");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");

const app = express();
const PORT = process.env.PORT || 3000;

const auth = require("./routes/auth");
const public = require("./routes/public");
const url = require("./config/setup").mongoURL;

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require("./strategies/google-strategy")(passport);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

//bodyparser middleware
app.use(bodyparser.urlencoded({ extended: false }));
// Express session midleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/auth", auth);
app.use("/public", public);

//conecting to db
mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch(err => console.log("Error : " + err));

app.get("/", (req, res) => {
  if (req.user) res.redirect("/auth/vote");
  else res.render("home");
});

app.listen(PORT, () => console.log("server running at port 3000"));
