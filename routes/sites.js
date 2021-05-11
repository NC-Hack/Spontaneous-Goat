const express = require('express'), router = express.Router();
const Site = require("../schemas/site.model");
const { checkSubAdmin } = require("../functions/checks");

router.get("/", (req, res) => {
    res.render("sub/siteHome", {
        user: req.user,
        site: req.site
    });
}).get("/admin", checkSubAdmin, (req, res) => {
    res.render("sub/admin", {
        user: req.user,
        site: req.site,
        message: req.flash("message")
    });
});

module.exports = router;
