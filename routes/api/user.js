const express = require("express"), router = express.Router();
const User = require("../../schemas/user.model");
const Site = require("../../schemas/site.model");
const { checkProfileInfo } = require("../../functions/checks");

router.post("/", async (req, res) => {
	//Create new user
	if (req.user) return res.redirectWithFlash("/error", { error: "You're already logged in, why would you need to register?" });
	let ui = [req.body.name, req.body.username, req.body.email, req.body.password, req.body.password_confirm, req.body.tos_check];
	if (!ui.every(i => i)) return res.redirectWithFlash("/register", { error: "You must complete all the fields" });
	if (req.body.password !== req.body.password_confirm) return res.redirectWithFlash("/register", { error: "Both password fields must match" });
	let error = await checkProfileInfo(req.body.name, req.body.username, null, req.body.email, req.body.password);
	if (error) return res.redirectWithFlash("/register", { error });
	let u = await new User({
		global: {
			name: req.body.name,
			username: req.body.username,
			email: req.body.email,
			created: new Date()
		},
	}).save();
	u.global.password = u.generateHash(req.body.password);
	u = await u.generateAuthToken();
	res.cookie("NCH_Auth_Token", u.global.persist_token, { "domain": process.env.DOMAIN });
	req.user = u;
	res.redirect(`/profile/${u.username}`);
}).get("/:user", async (req, res) => {
	const user = await User.findOne({ "global.username": req.params.user });
	if (!user) return res.sendStatus(404);
	let auth = req.headers.authorization === user.global.persist_token;
	res.send({
		name: user.global.name,
		username: user.global.username,
		created: user.global.created,
		attained_badges: user.global.attained_badges,
		bio: user.global.bio,
		email: auth ? user.global.email : "",
		_id: user._id
	});
}).post("/:user/edit", async (req, res) => {
	const user = await User.findOne({ "global.username": req.params.user });
	if (!user) return res.sendStatus(404);
	console.log(req.body);
	let hi = [req.body.name, req.body.username, req.body.email];
	if (!hi.every(i => i)) return res.redirectWithFlash(`/profile/${req.user.global.username}`, { error: "You must complete the name, username, and email fields" });
	let error = await checkProfileInfo(req.body.name, req.body.username, req.body.bio, req.body.email, null, user);
	if (error) return res.redirectWithFlash(`/profile/${req.user.global.username}`, { error });
	user.global.name = req.body.name;
	user.global.username = req.body.username;
	user.global.bio = req.body.bio;
	user.global.email = req.body.email;
	await user.save();
	return res.redirectWithFlash(`/profile/${user.global.username}`, { message: "Profile edited!" });
}).get("/:user/hackathons", async (req, res) => {
	const user = await User.findOne({ "global.username": req.params.user });
	if (!user) return res.sendStatus(404);
	const member_hackathons = await Site.find({ members: user._id });
	const admin_hackathons = await Site.find({ admins: user._id });
	const resp = { admin: [], member: [] };
	member_hackathons.forEach(h => resp.member.push({ name: h.name, url: h.slug, description: h.description, created: h.created, _id: h._id }));
	admin_hackathons.forEach(h => resp.admin.push({ name: h.name, url: h.slug, description: h.description, created: h.created, _id: h._id }));
	res.send(resp);
});

module.exports = router;
