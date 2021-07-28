const express = require("express"), router = express.Router();
const Site = require("../schemas/site.model");
const { queryApi } = require("../functions/api");

router.get("/", (req, res) => {
	res.render("index", {
		user: req.user
	});
})
	// Registration / Login / Logout
	.get("/register", (req, res) => {
		if (req.user) return res.redirectWithFlash("/error", { error: "While we like people signing up for NC Hack, there's no need to do it when you're already logged in" });
		res.render("account_flow/register", { error: req.flash("error") || null });
	})
	.get("/login", (req, res) => {
		if (req.user) return res.redirectWithFlash("/error", { error: "You're already logged in, isn't that enough?" });
		res.render("account_flow/login", { error: req.flash("error") || null });
	})
	.get("/logout", (req, res) => {
		if (!req.user) return res.redirectWithFlash("/error", { error: "You can't turn off a light that's already off... the same thing goes for logging out when you're not even logged in" });
		if (req.session) req.session.destroy();
		res.clearCookie("NCH_Auth_Token", { domain: process.env.DOMAIN });
		res.redirect("/");
	})
	// Hackathon Global Flow
	.get("/hackathons", async (req, res) => {
		let user_hackathons = req.user ? await Site.find({ admins: req.user._id }) : [];
		let hackathons = await Site.find({ "internal.status": "approved" });
		res.render("global_site/hackathons", { message: req.flash("message") || null, user_hackathons, hackathons, user: req.user });
	})
	.get("/hackathons/join", async (req, res) => {
		res.render("global_site/join_hackathon", { message: req.flash("message"), error: req.flash("error"), user: req.user });
	})
	.get("/hackathons/create", (req, res) => {
		if (!req.user) return res.redirectWithFlash("/error", { error: "You must be logged in" });
		res.render("global_site/create", { error: req.flash("error") || null });
	})
	// Profile
	.get("/profile", (req, res) => {
		if (!req.user) return res.render("basic/genericError", { error: "You must be logged in to view your profile" });
		res.redirect(`/profile/${req.user.global.username}`);
	})
	.get("/profile/:name", async (req, res) => {
		const user = await queryApi(`user/${req.params.name}`, req.user);
		if (!user || user.statusCode === 404 || !user.body) return res.redirect("/404");
		const hackathons = await queryApi(`user/${req.params.name}/hackathons`, req.user);
		res.render("global_site/profile", {
			user: user.body,
			hackathons,
			self: req.user._id.toString() === user.body._id.toString(),
			message: req.flash("message"),
			error: req.flash("error")
		});
	})
	// General
	.get("/terms", (req, res) => {
		res.render("basic/terms");
	})
	.get("/about", (req, res) => {
		res.render("basic/about");
	})
	.get("/contact", (req, res) => {
		res.render("basic/contact");
	})
	.get("/error", (req, res) => {
		res.render("basic/genericError", { error: req.flash("error") || null });
	}).use("/admin", require("./frontend/admin"))
	.get("*", (req, res) => {
		res.render("basic/404");
	});


module.exports = router;
