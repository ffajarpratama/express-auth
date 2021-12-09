'use strict';

module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    userId: DataTypes.INTEGER,
    token: DataTypes.STRING,
  });

  return PasswordReset;
}