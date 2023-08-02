module.exports = (sequelize, DataTypes) => {
    const vehMods = sequelize.define("vehicle_mods", {
        vehicleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    })

    return vehMods;
}