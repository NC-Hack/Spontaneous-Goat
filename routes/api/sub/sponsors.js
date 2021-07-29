const express = require("express"), router = express.Router();
const { checkSubAdmin, checkSubdomain } = require("../../../functions/checks");
const isImageURL = require("image-url-validator").default;

router.post("/create", checkSubdomain, checkSubAdmin, async (req, res) => {
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
}).get("/:id", checkSubdomain, (req, res) => {
	if (!req.params.id || !req.site.sponsors.find(s => s._id.toString() === req.params.id)) return res.sendStatus(404);
	return req.send(req.site.sponsors.find(s => s._id.toString() === req.params.id));
}).post("/:id/delete", checkSubdomain, checkSubAdmin, async (req, res) => {
	if (!req.params.id || !req.site.sponsors.find(s => s._id.toString() === req.params.id)) return res.redirectWithFlash("error", { error: "Invalid sponsor ID" });
	req.site.sponsors.splice(req.site.sponsors.findIndex(s => s._id.toString() === req.params.id), 1);
	req.site.save();
	res.redirectWithFlash("/sponsors/manage", { message: "Successfully deleted sponsor!" });
});

module.exports = router;
