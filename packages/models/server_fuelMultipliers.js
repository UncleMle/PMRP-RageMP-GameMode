module.exports = (sequelize, DataTypes) => {
    const serverfuelMultipliers = sequelize.define("server_fuelMultipliers", {
        vehicleClass: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        multiplier: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    })

    return serverfuelMultipliers;
}