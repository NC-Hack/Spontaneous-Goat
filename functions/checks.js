module.exports = {
    checkAdmin: async function (req, res, next) {
        if (req.user && req.user.global.flags.root) next();
        else res.redirectWithFlash("error", { error: "lol nice try" });
    }
}
