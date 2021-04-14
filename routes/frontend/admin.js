const express = require('express'), router = express.Router();
const Site = require("../../schemas/site.model");
const User = require("../../schemas/user.model");
const { checkAdmin } = require("../../functions/checks");

router.get("/", checkAdmin, async (req, res) => {
    //Base admin
    res.render("admin/admin");
}).get("/review", checkAdmin, async (req, res) => {
    //Review
    let hackathons = await Site.find({ "internal.status": "review" });
    for await (let h of hackathons) {
        h.admin = await User.findOne({ _id: h.admins[0] });
    }
    res.render("admin/review", { hackathons, message: req.flash("message") || null });
});

module.exports = router;
