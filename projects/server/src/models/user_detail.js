"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class user_detail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The models/index file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
  
  user_detail.init({
    uuid: DataTypes.STRING,
    name: DataTypes.STRING,
    birth: DataTypes.DATEONLY,
    gender: DataTypes.ENUM('Male', 'Female'),
    image_profile: DataTypes.STRING,
    image_ktp: DataTypes.BLOB,
    userId: DataTypes.INTEGER,
    account_number: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'user_detail',
  });
  user_detail.associate = (models) => {
    user_detail.belongsTo(models.user, { foreignKey: 'userId' })
  }
  return user_detail;
};
