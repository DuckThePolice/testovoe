import { Sequelize } from "sequelize";

const USER = process.env.MYSQL_USER || "";
const PASSWORD = process.env.MYSQL_PASSWORD || "";
const DBNAME = process.env.MYSQL_DBNAME || "";
const HOST = process.env.MYSQL_HOST || "";
const PORT = process.env.MYSQL_PORT || "";

export const storage = new Sequelize(DBNAME, USER, PASSWORD, {
  host: HOST,
  dialect: "mysql",
  port: +PORT,
});

storage.sync({ alter: true });
