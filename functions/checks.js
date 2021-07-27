const User = require("../schemas/user.model");
const Site = require("../schemas/site.model");

function isAlphaNumeric(str, allow_spaces) {
	let code, i, len;
	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i);
		if (!(code > 47 && code < 58) && !(code > 64 && code < 91) && !(code > 96 && code < 123) && (allow_spaces ? code !== 32 : code === 32)) return false;
	}
	return true;
}

module.exports = {
	checkAdmin: async function (req, res, next) {
		if (req.user && req.user.global.flags.root) next();
		else res.redirectWithFlash("error", { error: "lol nice try" });
	},
	checkSubAdmin: async function (req, res, next)  {
		if (req.user && (req.user.global.flags.root || req.site.members.find(m => m.role === "admin" && m._id === req.user._id))) return next();
		return res.redirectWithFlash("error", { error: "You do not have permission to access this" });
	},
	checkSubdomain: async function (req, res, next) {
		if (!req.subdomains[0]) return res.redirectWithFlash("error", { error: "This is a subdomain-limited endpoint" });
		else next();
	},
	checkProfileInfo: async function (name, username, bio, email, password, u) {
		if (name && u.global.name !== name) {
			if (name.length > 32) return "Names must be 32 characters or less";
			if (!isAlphaNumeric(name, true)) return "Names must only contain alphanumeric characters";
		}
		if (username && u.global.username !== username) {
			if (username.length > 32) return "Usernames must be 32 characters or less";
			if (!isAlphaNumeric(username)) return "Usernames must only contain alphanumeric characters";
			if (await User.findOne({ "global.username": username })) return "This username has already been taken";
		}
		if (bio) {
			if (bio.length > 200) return "Bios must be 200 characters or less";
		}
		if (email && u.global.email !== email) {
			if (await User.findOne({ "global.email": email })) return "This email is already in use, try logging in instead?";
			const emailValidator = new (require("email-deep-validator"))({
				verifyMailbox: false
			});
			const {wellFormed, validDomain} = await emailValidator.verify(email);
			if (!wellFormed || !validDomain) return "You specified an invalid email";
		}
		if (password) {
			const regex = [{
				regex: /(?=[0-9])/,
				criteria: "At least one number"
			}, {
				regex: /(?=[a-z])/,
				criteria: "At least one lowercase letter"
			}, {
				regex: /(?=[A-Z])/,
				criteria: "At least one uppercase letter"
			}, {
				regex: /[\s\S]{8,}/,
				criteria: "At least 8 characters long"
			}];
			let missing = regex.filter(r => !r.regex.test(String(password))).map(r => `- ${r.criteria}`);
			return `Your password does not meet the following criteria:\n${missing.join("\n")}`;
		}
		return null;
	},
	checkHackathonInfo: async function (h, name, slug, desc, f_color, b_color, email, instagram, twitter, discord, github) {
		if (name && h.name !== name) {
			if (name.length > 32) return "Names must be 32 characters or less";
			if (!isAlphaNumeric(name)) return "Names must only contain alphanumeric characters";
		}
		if (slug) {
			if (slug.length > 32) return "Slugs must be 32 characters or less";
			if (!isAlphaNumeric(slug)) return "Slugs must only contain alphanumeric characters";
			if (await Site.findOne({ slug: slug })) return "This slug has already been taken";
		}
		if (desc && h.description !== desc) {
			if (desc.length > 400) return "Descriptions must be 400 characters or less";
		}
		if (email && h.socials.email !== email) {
			const emailValidator = new (require("email-deep-validator"))({
				verifyMailbox: false
			});
			const {wellFormed, validDomain} = await emailValidator.verify(email);
			if (!wellFormed || !validDomain) return "You specified an invalid email";
		}
		if (f_color && h.f_color !== f_color) {
			//wait
		}
		if (b_color && h.b_color !== b_color) {
			//wait
		}
		if (instagram && h.instagram !== instagram && !instagram.match(/(?:^|[^\w])(?:@)([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/)) return "Invalid Instagram username";
		if (twitter && h.twitter !== twitter && !instagram.match(/^@?(\w){1,15}$/)) return "Invalid Twitter username";
		if (discord && h.discord !== discord && !discord.match(/(?:discord.gg|discorda?p?p?\.com\/invite)\/([a-z0-9_-]+)/i)) return "Invalid Discord invite";
		if (github && h.github !== github && !github.match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)) return "Invalid GitHub username";
		return null;
	}
};
