import Sequelize from "sequelize";
import database from "./database.js";

const User = database.define('user', {
    UserName: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    Password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    IsAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
});
export default User;