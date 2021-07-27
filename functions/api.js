const p = require("phin");
module.exports = {
	queryApi: async function (qString, u) {
		return await p({
			url: `http${process.env.API_HTTPS === "on" ? "s" : ""}://${process.env.DOMAIN}/api/${qString}`,
			parse: "json",
			headers: {
				"authorization": u ? u.global.persist_token : ""
			}
		}).catch(() => {});
	}
};