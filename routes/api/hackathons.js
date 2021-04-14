const express = require('express'), router = express.Router();
const Site = require("../../schemas/site.model");
const { checkAdmin } = require("../../functions/checks");

router.post("/create", async (req, res) => {
    //Create new hackathon
    if (!req.user) return res.redirectWithFlash("/error", { error: "You must be logged in to create a hackathon" })
    let hi = [req.body.name, req.body.slug, req.body.description]
    if (!hi.every(i => i)) return res.redirectWithFlash("hackathons/create", { error: "You must complete all the fields" });
    if (await Site.findOne({ "slug": req.body.slug })) return res.redirectWithFlash("/hackathons/create", { error: "This slug is already in use, try picking a different one" });
    await new Site({
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        created: new Date(),
        admins: [req.user._id]
    }).save();
    res.redirectWithFlash('/hackathons', { message: "Your hackathon has been submitted for review! You'll receive an email when it has been reviewed by our team." });
}).post("/approve/:id", checkAdmin, async (req, res) => {
    let s = await Site.findOne({ _id: req.params.id });
    if (!s) return res.redirectWithFlash("error", { error: "Hackathon ID not found" });
    if (s.internal.status !== "review") return res.redirectWithFlash("error", { error: "Hackathon already reviewed" });
    s.internal.status = "approved";
    s.internal.approval_staff = req.user._id;
    s.save();
    res.redirectWithFlash('/admin/review', { message: `Approved ${s.name}` });
}).post("/deny/:id", checkAdmin, async (req, res) => {
    let s = await Site.findOne({ _id: req.params.id });
    if (!s) return res.redirectWithFlash("error", { error: "Hackathon ID not found" });
    if (s.internal.status !== "review") return res.redirectWithFlash("error", { error: "Hackathon already reviewed" });
    s.internal.status = "denied";
    s.internal.approval_staff = req.user._id;
    s.save();
    res.redirectWithFlash('/admin/review', { message: `Denied ${s.name}` });
});

module.exports = router;
