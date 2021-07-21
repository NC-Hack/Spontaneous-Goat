const express = require('express'), router = express.Router();
const { checkAdmin, checkSubAdmin, checkSubdomain } = require("../../functions/checks");
const isImageURL = require("image-url-validator").default;

router.get("/ping", (req, res) => {
    res.send("Hello World!");
}).post("/edit", checkSubdomain, checkSubAdmin, (req, res) => {
    req.site.name = req.body.name;
    req.site.save();
    res.redirectWithFlash("/admin", { message: "Your changes have been saved." });
}).post("/sponsors/create", checkSubdomain, checkSubAdmin, async (req, res) => {
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
});

module.exports = router;
