const { Schema, model } = require("mongoose");

let siteModel = new Schema({
	name: { type: String, required: true },
	slug: { type: String, required: true },
	description: { type: String, required: true },
	members: [{
		_id: Schema.Types.ObjectId,
		role: String,
		founder: Boolean
	}],
	internal: {
		status: { type: String, default: "review" },
		approval_staff: Schema.Types.ObjectId,
		official: { type: Boolean, default: false }
	},
	created: Date,
	subtitle: { type: String, default: "A cool hackathon!" },
	f_color: { type: String, default: "#FFFFFF" },
	b_color: { type: String, default: "#211348" },
	sponsors: [{
		_id: {
			type: Schema.Types.ObjectId,
			auto: true
		},
		name: String,
		description: String,
		header_img: String,
		logo_img: String,
		location: String,
		contact: String
	}],
	socials: {
		instagram: String,
		twitter: String,
		discord: String,
		github: String,
		email: String
	}
});

// Methods
module.exports = model("Site", siteModel);
