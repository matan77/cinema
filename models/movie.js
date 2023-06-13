import Sequelize, { DataTypes } from "sequelize";
import database from "./database.js";

const Movie = database.define('movie', {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    Name: Sequelize.STRING,
    Price: Sequelize.INTEGER,
    Datetime: {
        type: Sequelize.DATE,
        allowNull: true
    }
});
export default Movie;