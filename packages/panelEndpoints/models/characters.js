module.exports = (sequelize, DataTypes) => {
    const characters = sequelize.define("characters", {
        banned: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        sex: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        cName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        lastActive: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        health: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        thirst: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        licenses: {
            type: DataTypes.STRING('1234'),
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },
        pinNum: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        factionOne: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        factionTwo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        factionOneLvl: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        factionTwoLvl: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        hunger: {
            type: DataTypes.INTEGER,
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
        cashAmount: {
            type: DataTypes.BIGINT(1),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        debt: {
            type: DataTypes.BIGINT(1),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        salary: {
            type: DataTypes.BIGINT(1),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        job: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        phoneData: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        maxVehicles: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        maxHouses: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        isInjured: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        injuredTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        OwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        playTime: {
            type: DataTypes.BIGINT(1),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    })

    return characters;
}