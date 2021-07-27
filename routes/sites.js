const express = require("express"), router = express.Router();
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
		message: req.flash("message"),
		error: req.flash("error")
	});
}).use("/sponsors", require("./frontend/sub/sponsors"))
	.use("/api", require("./api/sub_api"))
	.get("*", (req, res) => {
		res.render("basic/404", {
			user: req.user,
			site: req.site
		});
	});

module.exports = router;
