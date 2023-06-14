import Sequelize from "sequelize";
import database from "./database.js";
import Movie from "./movie.js";

const Seat = database.define('seat', {
    Row: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    Column: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    movieId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    }
});

Seat.belongsTo(Movie);

export default Seat;
