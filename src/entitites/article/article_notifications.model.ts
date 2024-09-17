import { CreationOptional, DataTypes, InferAttributes, Model } from "sequelize";
import { storage } from "../../connection";
import { Article } from "./article.model";
import { User } from "../user/user.model";

interface ArticleNotificationCreationAttributes {
  article_id: number;
  user_id: number;
}

export class ArticleNotifications extends Model<
  InferAttributes<ArticleNotifications>,
  ArticleNotificationCreationAttributes
> {
  article_id!: number;
  user_id!: number;
  declare id: CreationOptional<number>;
}

ArticleNotifications.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    article_id: { type: DataTypes.BIGINT },
    user_id: { type: DataTypes.BIGINT },
  },
  { sequelize: storage, timestamps: true, tableName: "articleNotifications" }
);

ArticleNotifications.belongsTo(Article, {
  foreignKey: "article_id",
});
ArticleNotifications.belongsTo(User, {
  foreignKey: "user_id",
});
