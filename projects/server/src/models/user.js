"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    user.init(
        {
            uuid: DataTypes.STRING,
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            phone: DataTypes.STRING,
            attempts: DataTypes.INTEGER,
            isSuspended: DataTypes.BOOLEAN,
            otpCount: DataTypes.INTEGER,
            otpCountDate: DataTypes.DATEONLY,
            otp: DataTypes.STRING,
            isVerified: DataTypes.BOOLEAN,
            isDeleted: DataTypes.BOOLEAN,
            roleId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "user",
        }
    );
    user.associate = (models) => {
        user.hasOne(models.user_detail, { foreignKey: "userId" });
        user.belongsTo(models.role, { foreignKey: "roleId" });
        user.hasMany(models.property, { foreignKey: "userId" });
        
    };
    return user;
};
