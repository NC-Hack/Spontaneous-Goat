const p = require("phin");
module.exports = {
	queryApi: async function (qString) {
		return await p({
			url: `http${process.env.API_HTTPS === "on" ? "s" : ""}://${process.env.DOMAIN}/api/${qString}`,
			parse: "json"
		}).catch(() => {});
	}
}