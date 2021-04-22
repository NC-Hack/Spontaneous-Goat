const Site = require("../schemas/site.model");
module.exports = {
    checkAdmin: async function (req, res, next) {
        if (req.user && req.user.global.flags.root) next();
        else res.redirectWithFlash("error", { error: "lol nice try" });
    },
    checkSubAdmin: async function (req, res, next)  {
        if (req.user && (req.user.global.flags.root || req.site.admins.includes(req.user._id))) return next();
        return res.redirectWithFlash("error", { error: "You do not have permission to access this" });
    }
}
