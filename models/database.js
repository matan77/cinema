import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const connection = new Sequelize(process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        dialect: 'mysql',
        host: 'localhost',
        timezone: process.env.DATABASE_TIMEZONE
    }
);

export default connection;