const express = require('express'), router = express.Router();
const Site = require("../schemas/site.model");

router.get("/", (req, res) => {
    res.render("index", {
        user: req.user
    });
})
    // Registration / Login / Logout
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
    // Hackathon Global Flow
    .get("/hackathons", async (req, res) => {
        let hackathons = req.user ? await Site.find({ admins: req.user._id }) : [];
        res.render("hackathons", { message: req.flash("message") || null, hackathons });
    })
    .get("/hackathons/create", (req, res) => {
        if (!req.user) return res.redirectWithFlash("/error", { error: "You must be logged in" });
        res.render("create", { error: req.flash("error") || null });
    })
    // General
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
