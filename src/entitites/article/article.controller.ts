import { Article, publishEvent } from "./article.model";
import e, { Request, Response } from "express";
import { User } from "../user/user.model";
import { ArticleAttachments } from "./article_attachments.model";
import formidable from 'formidable'
import { Cloud } from "../../cloud";
import { ArticleRequest } from "./article.middleware";
import { ArticleNotifications } from "./article_notifications.model";
import jwt from "jsonwebtoken"
import {decode} from "jwt-js-decode"
import { eventHost } from "../..";
export class ArticleController{
    async createArticle(req:ArticleRequest, res:Response)
    {
        const form = formidable({})
        const [fields, files] = await form.parse(req)
        var cloud = new Cloud()
        var userId = req.userId || 0
        var user = await User.findOne({
            where:{id:userId?.toString()}
        })
        if (!user || !user.dataValues.active)
            return res.status(400).json({msg:"Пользователя с таким id не существует или его учётная запись ещё не активирована"})


        var article
        try {
            var json = JSON.stringify(files["preview"])
            var ar = JSON.parse(json)
            var path = ar[0]["filepath"]
            var type = ar[0]["mimetype"]
            var public_id=undefined
            
            if(type.includes("video"))
                public_id = await cloud.upload(path,true)
            else
                public_id = await cloud.upload(path,false)

            if (!public_id)
                return res.status(400).json({msg:"Не удалось загрузить превью статьи"})

            article = await Article.create({
                author: userId,
                title: String(fields["title"]?.toString()),
                preview:String(public_id),
                text: String(fields["text"]?.toString()),
            })

            for (var i = 1;i<=10;i++)
                {
                    var string = `attachment_`+i
                    if(files[string]!=undefined)
                    {
                        var json = JSON.stringify(files[string])
                        var ar = JSON.parse(json)
                        var path = ar[0]["filepath"]
                        var type = ar[0]["mimetype"]
                        var public_id=undefined
                        if(type.includes("video"))
                            public_id = await cloud.upload(path,true)
                        else
                            public_id = await cloud.upload(path,false)
                        await ArticleAttachments.create(
                        {
                            article_id:article.dataValues.id,
                            attachment:String(public_id)
                        })

                    }
                    
                    
                }

        }
        catch (err)
        {
            return res.status(400).json({msg:err})
        }
        return res.status(201).json({msg:"Статья успешно создана"})
    }
    async makeArticlePublic(req:Request, res:Response)
    {
        var id = req.params.id
        const article = await Article.findOne({where:{id:id}})
        if (!article?.dataValues)
            return res.status(400).json({msg:"Статья с таким id не найдена"})
        if (!article.dataValues.isPrivate)
            return res.status(400).json({msg:"Статья уже опубликована"})
        article.update({
            isPrivate:false
        })

        const users = await User.findAll({where:{active:true}})
      users.forEach(async user => {
            try {
                await ArticleNotifications.create({
                    article_id: article.dataValues.id,
                    user_id: user.dataValues.id
                });
            }
            catch (err) {
                return res.status(402).json({ msg: "Не удалось уведомить пользователя" });
            }
        })
        eventHost.dispatchEvent(publishEvent)

        return res.status(201).json({msg:"Статья успешно опубликована"})
    }
    async editArticle(req:Request, res:Response)
    {
        var id = req.params.id
        const form = formidable({})
        const [fields, files] = await form.parse(req)
        var cloud = new Cloud()


        var article = await Article.findOne({where:{id:id}})
        try {
            if(!article)
                return res.status(400).json({msg:"Статьи с таким id не существует"})
            var json = JSON.stringify(files["preview"])
            var ar = JSON.parse(json)
            var path = ar[0]["filepath"]
            var type = ar[0]["mimetype"]
            var public_id=undefined
            if(type.includes("video"))
                public_id = await cloud.upload(path,true)
            else
                public_id = await cloud.upload(path,false)

            if (!public_id)
                return res.status(400).json({msg:"Не удалось загрузить превью статьи"})

             await article.update({
                title: String(fields["title"]?.toString()),
                preview:String(public_id),
                text: String(fields["text"]?.toString()),
            })
     await ArticleAttachments.destroy({
                where: {article_id:id}
            })
            for (var i = 1;i<=10;i++)
                {
                    var string = `attachment_`+i
                    if(files[string]!=undefined)
                    {
                        var json = JSON.stringify(files[string])
                        var ar = JSON.parse(json)
                        var path = ar[0]["filepath"]
                        var type = ar[0]["mimetype"]
                        var public_id=undefined

                        if(type.includes("video"))
                            public_id = await cloud.upload(path,true)
                        else
                            public_id = await cloud.upload(path,false)

                        await ArticleAttachments.create(
                        {
                            article_id:article.dataValues.id,
                            attachment:String(public_id)
                        })

                    }
                    
                    
                }

        }
        catch (err)
        {
            return res.status(400).json({msg:err})
        }
        return res.status(201).json({msg:"Статья успешно обновлена"})
    }
    async deleteArticle(req:Request, res:Response)
    {
        var id = req.params.id
        var article
        try
        {
            article = await Article.findOne({where:{id:id}})
            if (!article)
                return res.status(400).json({msg:"Статьи с таким id не существует"})
            await ArticleAttachments.destroy({where:{article_id:id}})
            await Article.destroy({where:{id:id}})      
        }
        catch (err)
        {
            return res.status(400).json({msg:err})
        }
        return res.status(202).json({msg:"Статья успешно удалена"})
    }
    async getPublicArticles(req: Request, res:Response)
    {
        const articles = await Article.findAll({
            where: {isPrivate:false},
            order: [['createdAt','Desc']]
        })
        return res.status(202).json(articles)
    }
    async getAttachmentsByArticleId(req:Request, res:Response){
        var id = req.params.id
        const attachments = await ArticleAttachments.findAll({
            where: {article_id:id}
        })
        return res.status(202).json(attachments)
    }
    
}