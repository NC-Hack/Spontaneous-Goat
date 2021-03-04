const express = require('express'), router = express.Router();

router.get("/", (req, res) => {
    res.render("index", {
        user: req.user
    });
})
    .get("/register", (req, res) => {
        res.render("register");
    })
    .get("/terms", (req, res) => {
        res.render("terms");
    })
    .get("*", (req, res) => {
        res.render("404");
    });

module.exports = router;
