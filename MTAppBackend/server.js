/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");
var express = require("express");
var passport = require("passport");
var stringifyObj = require("stringify-object");
var bodyParser = require("body-parser");

var app = express();

passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));
app.use(passport.initialize());
app.use(passport.authenticate("JWT", {
	session: false
}));
app.use(bodyParser.json());

// app functionality
app.get("/", function (req, res) {
	var reqStr = stringifyObj(req.authInfo.userInfo, {
    indent: "   ",
    singleQuotes: false
});

	reqStr += "\n\n";

	reqStr += stringifyObj(req.authInfo.scopes, {
    indent: "   ",
    singleQuotes: false
});

	var responseStr = "<!DOCTYPE HTML><html><head><title>MTApp</title></head><body><h1>MTApp</h1><h2>Welcome " + req.authInfo.userInfo.givenName +
		" " + req.authInfo.userInfo.familyName + "!</h2><p><b>Subdomain:</b> " + req.authInfo.subdomain + "</p><br /><a href=\"/get_legal_entity\">/get_legal_entity</a><br /><p><b>Identity Zone:</b> " + req.authInfo
		.identityZone + "</p><p><b>Origin:</b> " + req.authInfo.origin + "</p>" + "<br /><br /><pre>" + reqStr + "</pre>" + "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/get_legal_entity", function (req, res) {
	var reqStr = stringifyObj(req.authInfo.userInfo, {
		indent: "   ",
		singleQuotes: false
	});

	reqStr += "\n\n";

	
	reqStr += stringifyObj(req.authInfo.scopes, {
		indent: "   ",
		singleQuotes: false
	});
	
	var tagStr = "subdomain:" + req.authInfo.subdomain;
	
	reqStr += "\nSearching for a bound hana container with tag: " + tagStr + "\n";
	
	var services = xsenv.getServices({
		hana: { tag: tagStr }
	});
	
	var svcsStr = stringifyObj(services, {
		indent: "   ",
		singleQuotes: false
	});

	reqStr += "\n\n";

	reqStr += svcsStr;
	
	reqStr += "\n\n";

	//SELECT * FROM "LEGAL_ENTITY"
	
	//Create DB connection with options from the bound service
	let conn = hdbext.createConnection();
	
	var connParams = {
		serverNode: hanaOptions.hana.host + ":" + hanaOptions.hana.port,
		uid: hanaOptions.hana.user,
		pwd: hanaOptions.hana.password,
		CURRENTSCHEMA: hanaOptions.hana.schema
	};

	//connect
	conn.connect(services.hana, (err) => {
		if (err) {
			reqStr += "ERROR: ${err.toString()}";
			var responseStr = "<!DOCTYPE HTML><html><head><title>MTApp</title></head><body><h1>MTApp Legal Entities</h1><h2>Legal Entities</h2><p><pre>" + reqStr + "</pre>" + "<br /> <a href=\"/\">Back</a><br /></body></html>";
			return res.status(200).send(responseStr);
		} else {
			conn.exec('SELECT * FROM "LEGAL_ENTITY"', (err, result) => {
				if (err) {
					reqStr += "ERROR: ${err.toString()}";
					var responseStr = "<!DOCTYPE HTML><html><head><title>MTApp</title></head><body><h1>MTApp Legal Entities</h1><h2>Legal Entities</h2><p><pre>" + reqStr + "</pre>" + "<br /> <a href=\"/\">Back</a><br /></body></html>";
					return res.status(200).send(responseStr);
				} else {
					conn.disconnect();
					reqStr += "RESULTSET: \n\n" + stringifyObj(result, {indent: "   ",singleQuotes: false}) +  "\n\n";
					var responseStr = "<!DOCTYPE HTML><html><head><title>MTApp</title></head><body><h1>MTApp Legal Entities</h1><h2>Legal Entities</h2><p><pre>" + reqStr + "</pre>" + "<br /> <a href=\"/\">Back</a><br /></body></html>";
					return res.status(200).send(responseStr);
				}
			});
		}
		return null;
	});
	
	var responseStr = "<!DOCTYPE HTML><html><head><title>MTApp</title></head><body><h1>MTApp Legal Entities</h1><h2>Legal Entities</h2><p><pre>" + reqStr + "</pre>" + "<br /> <a href=\"/\">Back</a><br /></body></html>";
	res.status(200).send(responseStr);
});


// subscribe/onboard a subscriber tenant
app.put("/callback/v1.0/tenants/*", function (req, res) {
	var tenantAppURL = "https:\/\/" + req.body.subscribedSubdomain + "-ar" + ".cfapps.us10.hana.ondemand.com";
	res.status(200).send(tenantAppURL);
});

// unsubscribe/offboard a subscriber tenant
app.delete("/callback/v1.0/tenants/*", function (req, res) {
	res.status(200).send("");
});

var server = require("http").createServer();
var port = process.env.PORT || 3000;

server.on("request", app);

server.listen(port, function () {
	console.info("Backend: " + server.address().port);
});