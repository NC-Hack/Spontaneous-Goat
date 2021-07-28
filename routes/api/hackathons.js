const express = require("express"), router = express.Router();
const Site = require("../../schemas/site.model");
const User = require("../../schemas/user.model");
const { checkAdmin, checkHackathonInfo } = require("../../functions/checks");
const { sendEmail } = require("../../functions/emails");

router.get("/", async (req, res) => {
	let hackathons = await Site.find({ "internal.status": "approved" });
	let resp = [];
	hackathons.forEach(h => resp.push({ name: h.name, url: h.slug, description: h.description, created: h.created, _id: h._id }));
	res.send(resp);
}).post("/join", async (req, res) => {
	if (!req.user) return res.redirectWithFlash("/error", { error: "You must be logged in to create a hackathon" });
	if (!req.body.slug) return res.redirectWithFlash("/hackathons/join", { error: "You must specify a hackathon to join" });
	let h = await Site.findOne({ slug: req.body.slug.toLowerCase() });
	if (!h) return res.redirectWithFlash("/hackathons/join", { error: "Invalid hackathon code" });
	if (h.members.find(m => m._id.toString() === req.user._id.toString())) return res.redirectWithFlash("/hackathons/join", { error: "You are already a member of this hackathon" });
	h.members.push({
		_id: req.user._id,
		role: "member"
	});
	await h.save();
	return res.redirectWithFlash("/hackathons", { message: `You have joined "${h.name}"` });
}).post("/create", async (req, res) => {
	//Create new hackathon
	if (!req.user) return res.redirectWithFlash("/error", { error: "You must be logged in to create a hackathon" });
	let hi = [req.body.name, req.body.slug, req.body.description];
	if (!hi.every(i => i)) return res.redirectWithFlash("/hackathons/create", { error: "You must complete all the fields" });
	let e = await checkHackathonInfo({}, req.body.name, req.body.slug.toLowerCase(), req.body.description);
	if (e) return res.redirectWithFlash("/hackathons/create", { error: e });
	await new Site({
		name: req.body.name,
		slug: req.body.slug.toLowerCase(),
		description: req.body.description,
		created: new Date(),
		members: [{
			_id: req.user._id,
			role: "admin",
			founder: true
		}]
	}).save();
	res.redirectWithFlash("/hackathons", { message: "Your hackathon has been submitted for review! You'll receive an email when it has been reviewed by our team." });
}).post("/approve/:id", checkAdmin, async (req, res) => {
	let s = await Site.findOne({ _id: req.params.id });
	if (!s) return res.redirectWithFlash("error", { error: "Hackathon ID not found" });
	if (s.internal.status !== "review") return res.redirectWithFlash("/error", { error: "Hackathon already reviewed" });
	s.internal.status = "approved";
	s.internal.approval_staff = req.user._id;
	s.save();
	let u = await User.findOne({ _id: s.members.find(m => m.founder)._id });
	if (u) await sendEmail([u], "Your hackathon has been approved!", `Hi ${u.global.name},<br><br>We're excited to let you know that your shiny new hackathon <strong>${s.name}</strong> has been approved! You can start setting up your website at <a href="https://${s.slug}.nchack.org">${s.slug}.nchack.org</a>.<br>If you need any help, feel free to hit us up at <a href="mailto:team@nchack.org">team@nchack.org</a>.<br><br>Happy hacking!<br>- NC Hack`);
	res.redirectWithFlash("/admin/review", { message: `Approved ${s.name}` });
}).post("/deny/:id", checkAdmin, async (req, res) => {
	let s = await Site.findOne({ _id: req.params.id });
	if (!s) return res.redirectWithFlash("error", { error: "Hackathon ID not found" });
	if (s.internal.status !== "review") return res.redirectWithFlash("/error", { error: "Hackathon already reviewed" });
	s.internal.status = "denied";
	s.internal.approval_staff = req.user._id;
	s.save();
	let u = await User.findOne({ _id: s.members.find(m => m.founder)._id });
	if (u) await sendEmail([u], "Your hackathon has been denied", `Hi ${u.global.name},<br><br>Unfortunately, your hackathon application for <strong>${s.name}</strong> has been denied. Please feel free to resubmit when your hackathon meets our submission guidelines. If you have any questions about this decision, please email us at <a href="mailto:team@nchack.org">team@nchack.org</a>.<br><br>Happy hacking!<br>- NC Hack`);
	res.redirectWithFlash("/admin/review", { message: `Denied ${s.name}` });
}).get("/:slug", async (req, res) => {
	let h = await Site.findOne({ slug: req.params.slug });
	if (!h) return res.sendStatus(404);
	if (h.internal.status !== "approved") {
		if (req.headers.authorization) {
			let u = await User.findOne({ "global.persist_token": req.headers.authorization });
			if (!h.members.find(m => m.role === "admin" && m._id.toString() === u._id.toString() )) return res.sendStatus(403);
		} else return res.sendStatus(403);
	}
	res.send({ name: h.name, url: h.slug, description: h.description, created: h.created, _id: h._id });
});

module.exports = router;
