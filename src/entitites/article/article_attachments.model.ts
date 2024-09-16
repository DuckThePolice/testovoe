import { CreationOptional, DataTypes, InferAttributes, Model } from "sequelize";
import { storage } from "../../connection";
import { Article } from "./article.model";

interface ArticleAttachmentsCreationAttributes{
    article_id:number,
    attachment:string
}

export class ArticleAttachments extends Model<InferAttributes<ArticleAttachments>,ArticleAttachmentsCreationAttributes>{
    article_id!: number;
    attachment!: string;
    declare id: CreationOptional<number>
}

ArticleAttachments.init({
    id:{type: DataTypes.BIGINT, autoIncrement:true, primaryKey:true},
    article_id:{type:DataTypes.BIGINT},
    attachment:{
        type:DataTypes.TEXT, allowNull:false,
         validate:{
            notNull:{
                msg:"Вложение не может быть пустым"
            }
        }
    }
},
{sequelize:storage, timestamps:true, tableName:"articleAttachments"}
)
ArticleAttachments.belongsTo(Article,{
    foreignKey:"article_id"
})