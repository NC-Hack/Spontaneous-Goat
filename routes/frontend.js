const express = require('express'), router = express.Router();

router.get("/", (req, res) => {
    res.render("index", {
        user: req.user
    });
})
    .get("/register", (req, res) => {
        if (req.user) return res.redirectWithFlash("/error", { error: "While we like people signing up for NC Hack, there's no need to do it when you're already logged in" })
        res.render("register", { error: req.flash("error") || null });
    })
    .get("/login", (req, res) => {
        if (req.user) return res.redirectWithFlash("/error", { error: "You're already logged in, isn't that enough?" })
        res.render("login", { error: req.flash("error") || null });
    })
    .get("/logout", (req, res) => {
        if (!req.user) return res.redirectWithFlash("/error", { error: "You can't turn off a light that's already off... the same thing goes for logging out when you're not even logged in" });
        res.redirect("/api/logout");
    })
    .get("/terms", (req, res) => {
        res.render("terms");
    })
    .get("/error", (req, res) => {
        res.render("genericError", { error: req.flash("error") || null })
    })
    .get("*", (req, res) => {
        res.render("404");
    });

module.exports = router;
