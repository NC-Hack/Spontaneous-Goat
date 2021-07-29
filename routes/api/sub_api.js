const express = require("express"), router = express.Router();
const { checkSubAdmin, checkSubdomain, checkHackathonInfo } = require("../../functions/checks");

router.get("/ping", (req, res) => {
	res.send("Hello World!");
}).post("/edit", checkSubdomain, checkSubAdmin, async (req, res) => {
	let hi = [req.body.name, req.body.description, req.body.subtitle, req.body.f_color, req.body.b_color];
	if (!hi.every(i => i)) return res.redirectWithFlash("/admin", { error: "You must complete all the required fields" });
	let e = await checkHackathonInfo(req.site, req.body.name, null, req.body.description, req.body.subtitle, req.body.f_color, req.body.b_color, req.body.email, req.body.instagram, req.body.twitter, req.body.discord, req.body.github);
	if (e) return res.redirectWithFlash("/admin", { error: e });
	req.site.name = req.body.name;
	req.site.subtitle = req.body.subtitle;
	req.site.description = req.body.description;
	req.site.f_color = req.body.f_color;
	req.site.b_color = req.body.b_color;
	req.site.socials = {
		email: req.body.email,
		instagram: req.body.instagram,
		twitter: req.body.twitter,
		discord: req.body.discord,
		github: req.body.github
	};
	req.site.save();
	res.redirectWithFlash("/admin", { message: "Your changes have been saved." });
}).use("/user", require("./sub/user"))
	.use("/sponsors", require("./sub/sponsors"));

module.exports = router;
