module.exports = (sequelize, DataTypes) => {
    const characterDescs = sequelize.define("character_descriptions", {
        OwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    })
    return characterDescs;
}