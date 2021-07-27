const express = require("express"), router = express.Router();
const { checkSubAdmin, checkSubdomain, checkHackathonInfo } = require("../../functions/checks");
const isImageURL = require("image-url-validator").default;

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
}).post("/sponsors/create", checkSubdomain, checkSubAdmin, async (req, res) => {
	let hi = [req.body.name, req.body.description, req.body.location, req.body.contact, req.body.logo_img, req.body.header_img];
	if (!hi.every(i => i)) return res.redirectWithFlash("/sponsors/manage", { error: "You must complete all the fields" });
	if (!(await isImageURL(req.body.logo_img)) || !(await isImageURL(req.body.header_img))) return res.redirectWithFlash("/sponsors/manage", { error: "Image URLs must be valid" });
	req.site.sponsors.push({
		name: req.body.name,
		description: req.body.description,
		location: req.body.location,
		contact: req.body.contact,
		logo_img: req.body.logo_img,
		header_img: req.body.header_img
	});
	req.site.save();
	res.redirectWithFlash("/sponsors/manage", { message: `Sponsor "${req.body.name}" added!` });
});

module.exports = router;
