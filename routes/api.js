/*module.exports = (app, req, res) => {
    /**
     * /api
     *      -- User Login/Logout/Register/Modify --
     *      POST /login
     *      POST /logout
     *      GET /user/:user (get)
     *      POST /user/:user (create)
     *      PATCH /user/:user (edit)
     *      DELETE /user/:user (delete)
     *
     *      -- Actions on Userbase as a Whole --
     *      GET /users (amount of users or global info depending on authorization)
     *
     *
     *     [...].nchack.org
     *     nchack.org/[...]/
     *     - nchack.org/admin (control over everything)
     */
    //Possibly send to other files like challengeRoutes.js
   /* app.get("/ping", (req, res) => {
        res.send("Hello World");
    });
}
*/
const express = require('express'), router = express.Router();
const User = require("../../schemas/user.model");

router.get("/ping", (req, res) => {
    res.send("Hello World!");
}).post("/login", async (req, res) => {
    //Login a user
    if (req.user) return res.sendStatus(403);
    let ui = [req.body.username, req.body.password];
    if (!ui.every(i => i)) return res.redirect("/login?notComplete");
    let u = await User.findOne({ $or: { "global.username": req.body.username, "global.email": req.body.username } });
    if (!u) return res.redirect("/login?invalid");
    if (!u.validatePassword(req.body.password)) return res.redirect("/login?invalidPwd");
    res.cookie('NCH_Auth_Token', authToken);
    res.redirect('/');
}).use("/user", require("./api/user"));

module.exports = router;
