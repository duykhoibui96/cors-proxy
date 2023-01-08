var express = require("express"),
  request = require("request"),
  bodyParser = require("body-parser"),
  app = express();

var myLimit = typeof process.argv[2] != "undefined" ? process.argv[2] : "100kb";
console.log("Using limit: ", myLimit);

app.use(bodyParser.json({ limit: myLimit }));
app.use(bodyParser.urlencoded({ extended: true }));

app.all("*", function (req, res, next) {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers")
  );

  if (req.method === "OPTIONS") {
    // CORS Preflight
    res.send();
  } else {
    var targetURL = req.header("Target-URL");
    if (!targetURL) {
      res.send(500, {
        error: "There is no Target-Endpoint header in the request",
      });
      return;
    }

    const headers = {
      Authorization: req.header("Authorization"),
    };

    const xApiVersion = req.header("X-APi-version");
    if (xApiVersion) {
      headers["X-APi-version"] = xApiVersion;
    }

    let form;
    if (req.header("Content-Type") === "application/x-www-form-urlencoded") {
      headers["Content-Type"] = req.header("Content-Type");
      headers["Content-Length"] = req.header("Content-Length");
      form = req.body;
    }

    request(
      {
        url: targetURL + req.url,
        method: req.method,
        //json: req.body,
        form,
        headers,
      },
      function (error, response, body) {
        if (error) {
          console.error("error: " + response.statusCode);
        }
        //                console.log(body);
      }
    ).pipe(res);
  }
});

app.set("port", process.env.PORT || 4000);

app.listen(app.get("port"), function () {
  console.log("Proxy server listening on port " + app.get("port"));
});
