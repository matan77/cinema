import Sequelize from "sequelize";
import database from "./database.js";
import Movie from "./movie.js";

const Seat = database.define('seat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    Row: Sequelize.STRING,
    Column: Sequelize.STRING
});

Seat.belongsTo(Movie);


export default Seat;
