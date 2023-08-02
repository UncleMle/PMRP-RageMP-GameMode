module.exports = (sequelize, DataTypes) => {
    const playerDealerships = sequelize.define("player_dealerships", {
        OwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        currentVehicles: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        moneyAmount: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        dealerName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        dealerColour: {
            type: DataTypes.STRING,
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
        lastImport: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        vehicleSpawnPosition: {
            type: DataTypes.STRING('1234'),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    })

    return playerDealerships;
}