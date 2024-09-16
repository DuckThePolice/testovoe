import "dotenv/config"
import express from "express"
import cors from 'cors'
import { userRouter } from "./entitites/user/user.router"
import { articleRouter } from "./entitites/article/article.router"
import * as http from 'http'
import * as WebSocket from 'ws'
import { ArticleNotifications } from "./entitites/article/article_notifications.model"
import { Request } from "express"
import {decode} from "jwt-js-decode"
import { Json } from "sequelize/types/utils"
import { publishEvent } from "./entitites/article/article.model"

const port = process.env.PORT || 1337
async function checkNotifications(ws:WebSocket, req:Request) {
  const authHeader = req.headers.authorization || ""
  if (!authHeader.startsWith("Bearer ")) {
    ws.send ("Требуется авторизация")
    }
  const token = authHeader.split(" ")[1]
  var user_jwt = decode(token)
  var user_id = user_jwt.payload.userId
  var artifact = await ArticleNotifications.findOne()
  var notifications =  await ArticleNotifications.findAll({where:{user_id:user_id}})
      notifications.forEach(async notification => { 
        var sendMaterial = JSON.stringify(notification.dataValues)
        ws.send(sendMaterial)
        console.log(sendMaterial)
      });
    
    await ArticleNotifications.destroy({where:{user_id:user_id}})
    
}
const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/users", userRouter)
app.use("/api/articles",articleRouter)

const server = http.createServer(app)
export const eventHost = new EventTarget()
const wss = new WebSocket.Server({server, path:"/api/sockets"})

wss.on('connection',(ws:WebSocket, req:Request)=>{
  checkNotifications(ws,req).then(()=>console.log(""))
    eventHost.addEventListener('publish',()=>{
      checkNotifications(ws,req).then(()=>console.log(""))
    })
})





server.listen(port, ()=> {
    console.log(`Server succesufully started on ${port}`)
})
