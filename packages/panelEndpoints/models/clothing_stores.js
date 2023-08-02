module.exports = (sequelize, DataTypes) => {
    const clothingStores = sequelize.define("clothing_stores", {
        OwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        clothingName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        moneyAmount: {
            type: DataTypes.BIGINT(1),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        items: {
            type: DataTypes.STRING('1234'),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        lastRobbery: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        position: {
            type: DataTypes.STRING('1234'),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    })

    return clothingStores;
}