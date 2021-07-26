const { Schema, model } = require("mongoose");

let siteModel = new Schema({
	name: { type: String, required: true },
	slug: { type: String, required: true },
	description: { type: String, required: true },
	admins: [Schema.Types.ObjectId],
	users: [Schema.Types.ObjectId],
	internal: {
		status: { type: String, default: "review" },
		approval_staff: Schema.Types.ObjectId,
		official: { type: Boolean, default: false }
	},
	created: Date,
	f_color: { type: String, default: "#FFFFFF" },
	b_color: { type: String, default: "#211348" },
	sponsors: [{
		name: String,
		description: String,
		header_img: String,
		logo_img: String,
		location: String,
		contact: String
	}]
});

// Methods
module.exports = model("Site", siteModel);
