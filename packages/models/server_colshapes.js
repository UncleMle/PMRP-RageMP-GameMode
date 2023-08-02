module.exports = (sequelize, DataTypes) => {
    const serverColshapes = sequelize.define("server_colshapes", {
        name: {
            type: DataTypes.STRING,
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

    return serverColshapes;
}