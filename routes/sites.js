const express = require('express'), router = express.Router();
const Site = require("../schemas/site.model");
const { checkSubAdmin } = require("../functions/checks");

router.get("/", (req, res) => {
    res.render("sub/siteHome", {
        user: req.user
    });
}).get("/admin", (req, res) => {
    res.render("sub/admin", {
        user: req.user
    });
});

module.exports = router;
