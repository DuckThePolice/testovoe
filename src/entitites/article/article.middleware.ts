import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { Article } from "./article.model"

export interface ArticleRequest extends Request {
  userId?: number,
  article?: number
}

export async function ArticleMiddleware(
  req: ArticleRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization || ""
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      msg: "Требуется авторизация",
    })
  }
  const token = authHeader.split(" ")[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "")
    req.userId = (payload as { userId: number }).userId
    var article_id = req.params.id
    if (!article_id || article_id=="notifications")
        return next()

    var article = await Article.findOne({where:{id:article_id}})
 
    if (article?.dataValues.author!=req.userId)
        return res.status(401).json({
    msg:"Вы не автор данной статьи"})
    return next()
  } catch (e) {
    return res.status(401).json({
      msg: "Требуется авторизация",
    })
  }
}
