const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.set("PORT", process.env.PORT || 3000);
app.listen(app.get("PORT"), () =>
  console.log(
    `App is running at ${process.env.HOST || "localhost"}:${app.get("PORT")}`
  )
);

app.use(bodyParser.json());

app.use("/*", (req, res) => {
  const { baseUrl, originalUrl, method, query, body } = req;
  res.status(200);
  res.json({
    route: {
      baseUrl,
      originalUrl,
    },
    method,
    query,
    body,
  });
});
