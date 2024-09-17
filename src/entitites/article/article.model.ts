import { CreationOptional, DataTypes, InferAttributes, Model } from "sequelize";
import { User } from "../user/user.model";
import { storage } from "../../connection";
export const publishEvent = new Event("publish");
interface ArticleCreationAttributes {
  author: number;
  title: string;
  preview: string;
  text: string;
}

export class Article extends Model<
  InferAttributes<Article>,
  ArticleCreationAttributes
> {
  declare id: CreationOptional<number>;
  author!: number;
  title!: string;
  preview!: string;
  text!: string;
  isPrivate!: boolean;
}

Article.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    author: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "У статьи должен быть автор",
        },
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "У статьи должен быть заголовок",
        },
        len: [3, 50],
      },
    },
    preview: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "У статьи должно быть превью",
        },
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "У статьи должен быть текст",
        },
      },
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { sequelize: storage, timestamps: true, tableName: "article" }
);

Article.belongsTo(User, { foreignKey: "author" });
