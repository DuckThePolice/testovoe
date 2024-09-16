import { Router } from "express";
import { ArticleController } from "./article.controller";
import { ArticleMiddleware } from "./article.middleware";


export const articleRouter = Router()
const articleController = new ArticleController()

articleRouter.use("/:id",ArticleMiddleware)
articleRouter.use("/",ArticleMiddleware)
articleRouter.get("/",articleController.getPublicArticles)
articleRouter.post("/",articleController.createArticle)
articleRouter.patch("/:id",articleController.makeArticlePublic)
articleRouter.put("/:id",articleController.editArticle)
articleRouter.delete("/:id",articleController.deleteArticle)
articleRouter.get("/:id",articleController.getAttachmentsByArticleId)
