(async function() {
	console.log("NC Hack V2 has started.");
	const User = require("./schemas/user.model");
	const express = require("express");
	const Site = require("./schemas/site.model");
	const subdomain = require("express-subdomain");
	const app = express();
	const port = process.env.PORT || 80;
	const { connect, connection } = require("mongoose");
	const path = require("path");
	const favicon = require("serve-favicon");
	require("dotenv").config();

	// Configuration
	connect(process.env.MONGO, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	
	app.use(favicon(__dirname + '/public/images/favicon.ico'));


	connection.on("open", () => {
		console.log(`Connected to MongoDB: ${connection.name} (${connection.client.s.url})`);
	});

	connection.on("error", (err) => {
		console.log(`MongoDB Connection Error: ${err}`);
	});

	// Express setup
	app.use((require("body-parser")).urlencoded({ extended: true }));
	app.use(require("cookie-parser")("yum"));
	app.use(require("express-session")({ secret: "yum", resave: false, saveUninitialized: false }));
	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "views"));
	app.use(express.static(__dirname + "/public"));
	app.use((require("connect-flash"))());
	app.use(async (req, res, next) => {
		const authToken = req.cookies["NCH_Auth_Token"];
		if (authToken) req.user = await User.findOne({ "global.persist_token": authToken });
		next();
	});
	app.use(async (req, res, next) => {
		if (!req.subdomains[0]) return next();
		let s = await Site.findOne({ slug: req.subdomains[0] });
		if (!s) return res.render("basic/genericError", {
			error: "That subdomain was not found, check your spelling?"
		});
		req.site = s;
		next();
	});
	app.use(function (req, res, next) {
		res.redirectWithFlash = function (redirect, flash) {
			Object.keys(flash).forEach(f => {
				req.flash(f, flash[f]);
			});
			res.redirect(redirect);
		};
		next();
	});

	const getActualRequestDurationInMilliseconds = start => {
		const NS_PER_SEC = 1e9; //  convert to nanoseconds
		const NS_TO_MS = 1e6; // convert to milliseconds
		const diff = process.hrtime(start);
		return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
	};


	app.use(function (req, res, next) { //middleware function
		let current_datetime = new Date();
		let formatted_date =
			current_datetime.getFullYear() +
			"-" +
			(current_datetime.getMonth() + 1) +
			"-" +
			current_datetime.getDate() +
			" " +
			current_datetime.getHours() +
			":" +
			current_datetime.getMinutes() +
			":" +
			current_datetime.getSeconds();
		let method = req.method;
		let url = req.url;
		let status = res.statusCode;
		const start = process.hrtime();
		const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
		let log = `[${formatted_date}] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
		console.log(log);
		/*fs.appendFile("request_logs.txt", log + "\n", err => {
			if (err) {
				console.log(err);
			}
		});*/
		next();
	});


	//Subdomains
	let sites = await Site.find({ "internal.status": "approved" });
	for (let s of sites) {
		app.use(subdomain(s.slug, require("./routes/sites")));
		console.log(`Loaded site ${s.slug}.nchack.org`);
	}


	// Routes
	app.use("/api", require("./routes/api"));
	app.use("/", require("./routes/frontend"));

	// Launch server
	app.listen(port, () => console.log(`Server Started on Port ${port}`));
})();
