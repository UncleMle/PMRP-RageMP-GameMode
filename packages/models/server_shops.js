module.exports = (sequelize, DataTypes) => {
    const serverShops = sequelize.define("server_shops", {
        OwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        shopName: {
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

    return serverShops;
}