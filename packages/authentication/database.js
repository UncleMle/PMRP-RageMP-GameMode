
const FgReset="\x1b[0m";
const FgRed="\x1b[31m";

const db = require('../models')

db.sequelize.sync().then((req) => {
    logging: true
    mp.log(`${FgRed}[SEQUELIZE]${FgReset} Sequelize is now running.`)
});