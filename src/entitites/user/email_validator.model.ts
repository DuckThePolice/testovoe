import { Model, InferAttributes, DataTypes, CreationOptional } from "sequelize"
import { storage } from "../../connection";
import { User } from "./user.model";

interface EmailValidatorCreationAttributes {
    user_id: number,
    secret_code: string
}

export class EmailValidator extends Model<InferAttributes<EmailValidator>,EmailValidatorCreationAttributes>{
    user_id!: number;
    secret_code!: string;
    declare id: CreationOptional<number>
}

EmailValidator.init({
    id: {type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
    user_id:{type:DataTypes.BIGINT},
    secret_code: {type:DataTypes.STRING}
},
{indexes:[{unique:true, fields:["user_id"]}], sequelize:storage, timestamps: true, tableName:"emailVerificator"}
)

EmailValidator.belongsTo(User,{
foreignKey:"user_id",
})
