console.log("NC Hack V2 has started.");
const User = require("./schemas/user.model");
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const { connect, connection } = require("mongoose");
const path = require("path");
require('dotenv').config();

// Configuration
connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

connection.on("open", () => {
    console.log("Connected to MongoDB!");
});

connection.on("error", (err) => {
    console.log(`MongoDB Connection Error: ${err}`);
});

// Express setup
app.use((require("body-parser")).urlencoded({ extended: true }));
app.use(require("cookie-parser")("yum"));
app.use(require("express-session")({ secret: "yum", resave: false, saveUninitialized: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));
app.use((require("connect-flash"))())
app.use(async (req, res, next) => {
    const authToken = req.cookies["NCH_Auth_Token"];
    if (authToken) req.user = await User.findOne({ "global.persist_token": authToken });
    next();
});
app.use(function (req, res, next) {
    res.redirectWithFlash = function (redirect, flash) {
        Object.keys(flash).forEach(f => {
            req.flash(f, flash[f]);
        })
        res.redirect(redirect);
    }
    next();
});

// Routes
app.use("/api", require("./routes/api"));
app.use("/", require("./routes/frontend"));

// Launch server
app.listen(port, () => console.log(`Server Started on Port ${port}`));
