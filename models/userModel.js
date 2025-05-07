import { DataTypes } from 'sequelize';

export const createUserModel = (sequelize) =>
    sequelize.define('User', {
        username: {
            type:
                DataTypes.STRING,
                allowNull: false,
                unique: true
        },
        email: {
            type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
        },
        password: {
            type:
                DataTypes.STRING,
                allowNull: false
        },
        role: {
            type: 
            DataTypes.STRING,
            defaultValue: 'user',
        }
});
