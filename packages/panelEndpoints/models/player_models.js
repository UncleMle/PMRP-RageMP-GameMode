module.exports = (sequelize, DataTypes) => {
    const playerModels = sequelize.define("player_models", {
        characterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        data: {
            type: DataTypes.STRING('1234'),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    })

    return playerModels;
}