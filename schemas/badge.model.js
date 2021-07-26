const { Schema, model } = require("mongoose");

let badgeModel = new Schema({
	name: { type: String, required: true },
	icon: { type: String, required: true },
	hackathon: Schema.Types.ObjectId
});

// Methods
module.exports = model("Badge", badgeModel);
