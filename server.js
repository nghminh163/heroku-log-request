const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json", {
    defaultValue: {logs: []},
});
const uuid = require("uuid");
const chokidar = require("chokidar");
const watcher = chokidar.watch("db.json", {
    persistent: true,
});

function getAndSendData(db, io) {
    const logs = db.get("logs").value();
    io.emit("logs", logs);
}

watcher
    .on("add", (path) => {
        getAndSendData(db, io);
    })
    .on("change", (path) => {
        getAndSendData(db, io);
    })
    .on("unlink", (path) => {
        getAndSendData(db, io);
    });

const db = low(adapter);

const app = express();
app.use(bodyParser.json());
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.set("PORT", process.env.PORT || 3000);
http.listen(app.get("PORT"), () =>
    console.log(
        `App is running at ${process.env.HOST || "localhost"}:${app.get("PORT")}`
    )
);

io.on("connection", (socket) => {
    getAndSendData(db, io);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.use("/getDb", (req, res) => {
    const logs = db.get("logs").value();
    res.status(200);
    res.json(logs);
});

app.use("/*", (req, res) => {
    const {baseUrl, originalUrl, method, query, body} = req;
    const log = {
        id: uuid.v1(),
        route: {
            baseUrl,
            originalUrl,
        },
        method,
        query,
        body,
        time: moment().tz("Asia/Ho_Chi_MInh").format(),
    };
    db.get("logs").push(log).write();
    res.status(200);
    res.json(log);
});
