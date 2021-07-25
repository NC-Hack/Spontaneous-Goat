const { Schema, model } = require("mongoose");
const { hashSync, compareSync } = require("bcrypt");
const crypto = require("crypto");

let userSchema = new Schema({
	global: {
		name: String,
		username: String,
		bio: String,
		email: String,
		password: String,
		avatar: String,
		connections: {
			github: {},
			discord: {}
		},
		persist_token: String,
		email_verify_token: String,
		flags: {
			root: { type: Boolean, default: false },
			support: { type: Boolean, default: false },
			verified: { type: Boolean, default: false },
			emailValidated: { type: Boolean, default: false }
		},
		created: Date
	}
});

// Methods
/**
 * Returns a hashed password from input
 * @param password - The input password
 * @returns {*} - Hashed password
 */
userSchema.methods.generateHash = password => hashSync(password, 10);

/**
 * Checks an input password against the stored password for the user
 * @param password - The input password
 * @returns {Boolean} - If the password is correct (true) or incorrect (false)
 */
userSchema.methods.validatePassword = function (password) {
	return compareSync(password, this.global.password);
};

userSchema.methods.generateAuthToken = async function () {
	this.global.persist_token = crypto.randomBytes(30).toString("hex");
	this.save();
	return this;
};

module.exports = model("User", userSchema);
