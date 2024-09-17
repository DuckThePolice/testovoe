import { WebSocketServer } from "ws";
import { ArticleNotifications } from "./entitites/article/article_notifications.model";
import { getUserIdFromJwt } from "./utils";
import { Request } from "express";
export const eventHost = new EventTarget();
export async function checkNotifications(ws: WebSocket, req: Request) {
  if (!ws.OPEN) return;
  let user_id = getUserIdFromJwt(req.headers);
  if (!user_id) {
    ws.send("Требуется авторизация");
    return;
  }

  let artifact = await ArticleNotifications.findOne();
  let notifications = await ArticleNotifications.findAll({
    where: { user_id: user_id },
  });
  notifications.forEach(async (notification) => {
    let sendMaterial = JSON.stringify(notification.dataValues);
    ws.send(sendMaterial);
  });

  await ArticleNotifications.destroy({ where: { user_id: user_id } });
}

export async function runWSS(wss: WebSocketServer) {
  wss.on("connection", async (ws: WebSocket, req: Request) => {
    await checkNotifications(ws, req);
    eventHost.addEventListener("publish", async () => {
      await checkNotifications(ws, req);
    });
  });
}
