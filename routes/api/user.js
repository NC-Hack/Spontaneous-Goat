const express = require('express'), router = express.Router();
const User = require("../../schemas/user.model");

router.post("/", async (req, res) => {
        //Create new user
    if (req.user) return res.redirectWithFlash("/error", { error: "You're already logged in, why would you need to register?" })
        let ui = [req.body.name, req.body.username, req.body.email, req.body.password, req.body.password_confirm, req.body.tos_check]
        if (!ui.every(i => i)) return res.redirectWithFlash("/register", { error: "You must complete all the fields" });
        if (req.body.password !== req.body.password_confirm) return res.redirectWithFlash("/register", { error: "Both password fields must match" });
        if (await User.findOne({ "global.username": req.body.username })) return res.redirectWithFlash("/register", { error: "This username has already been taken" });
        if (await User.findOne({ "global.email": req.body.email })) return res.redirectWithFlash("/register", { error: "This email is already in use, try logging in instead?" });
        const emailValidator = new (require('email-deep-validator'))({
            verifyMailbox: false
        });
        const {wellFormed, validDomain} = await emailValidator.verify(req.body.email);
        if (!wellFormed || !validDomain) return res.redirectWithFlash("/register", { error: "You specified an invalid email" });
        let u = await new User({
            global: {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email
            },
        }).save();
        u.global.password = u.generateHash(req.body.password);
        u = await u.generateAuthToken();
        res.cookie('NCH_Auth_Token', u.global.persist_token);
        req.user = u;
        res.redirect('/');
});

module.exports = router;
