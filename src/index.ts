import "dotenv/config";
import express from "express";
import cors from "cors";
import { userRouter } from "./entitites/user/user.router";
import { articleRouter } from "./entitites/article/article.router";
import * as http from "http";
import WebSocket from "ws";
import { runWSS } from "./sockets";
const port = process.env.PORT || 1337;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/api/sockets" });
runWSS(wss);

server.listen(port, () => {
  console.log(`Server succesufully started on ${port}`);
});
