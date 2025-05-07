import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import { createUserModel } from './userModel.js';

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: config.development.dialect
  }
);

const User = createUserModel(sequelize);

//export const User = createUserModel(sequelize);

export { User };
export default sequelize; 
