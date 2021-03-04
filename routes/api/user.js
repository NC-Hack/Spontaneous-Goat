const express = require('express'), router = express.Router();
const User = require("../../schemas/user.model");
const crypto = require("crypto");

router.post("/", async (req, res) => {
        //Create new user
        if (req.user) return res.redirect("/");
        let ui = [req.body.name, req.body.username, req.body.email, req.body.password, req.body.password_confirm, req.body.tos_check]
        if (!ui.every(i => i)) return res.redirect("/register?notComplete");
        if (req.body.password !== req.body.password_confirm) return res.redirect("/register?passErr");
        const emailValidator = new (require('email-deep-validator'))({
            verifyMailbox: false
        });
        const {wellFormed, validDomain} = await emailValidator.verify(req.body.email);
        if (!wellFormed || !validDomain) return res.redirect("/register?emailErr");
        const generateAuthToken = () => {
            return crypto.randomBytes(30).toString('hex');
        }
        const authToken = generateAuthToken();
        let u = await new User({
            global: {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                persist_token: authToken
            },
        }).save();
        u.global.password = u.generateHash(req.body.password);
        u.save();
        res.cookie('NCH_Auth_Token', authToken);
        res.redirect('/');
});

module.exports = router;
