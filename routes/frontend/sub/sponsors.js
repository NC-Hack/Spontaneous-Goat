const express = require("express"), router = express.Router();
const { checkSubAdmin } = require("../../../functions/checks");

router.get("/", (req, res) => {
	res.render("sub/sponsors", {
		user: req.user,
		site: req.site,
		sponsors: req.site.sponsors
	});
}).get("/manage", checkSubAdmin, (req, res) => {
	res.render("sub/sponsors_manage", {
		user: req.user,
		site: req.site,
		message: req.flash("message"),
		error: req.flash("error"),
		sponsors: req.site.sponsors
	});
});

module.exports = router;
