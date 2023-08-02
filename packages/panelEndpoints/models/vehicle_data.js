module.exports = (sequelize, DataTypes) => {
    const vehicleData = sequelize.define("vehicle_data", {
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    })

    return vehicleData;
}