const express = require("express"), router = express.Router();
const { checkSubAdmin } = require("../functions/checks");
const { queryApi } = require("../functions/api");

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
}).get("/profile", (req, res) => {
	if (!req.user) return res.render("basic/genericError", { error: "You must be logged in to view your profile" });
	res.redirect(`/profile/${req.user.global.username}`);
}).get("/profile/:name", async (req, res) => {
	const user = await queryApi(`user/${req.params.name}`, req.user, req.site.slug);
	if (!user || user.statusCode === 404 || !user.body) return res.redirect("/404");
	res.render("sub/profile", {
		user: user.body,
		self: req.user._id.toString() === user.body._id.toString(),
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
