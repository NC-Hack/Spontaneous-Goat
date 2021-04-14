const { Schema, model } = require("mongoose");

let siteModel = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    admins: [Schema.Types.ObjectId],
    internal: {
       approved: { type: Boolean, default: false },
       approval_staff: Schema.Types.ObjectId,
       official: { type: Boolean, default: false }
    },
    created: Date
});

// Methods
module.exports = model("Site", siteModel);
