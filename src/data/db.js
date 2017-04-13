import Sequelize from 'sequelize';

const Conn = new Sequelize(
  'graphql',
  'graphql',
  'J1o6S1z9',
  {
    dialect: 'mysql',
    host: 'hosting.urancompany.com'
  }
);

const User = Conn.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [2, 16]
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  customerId: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

// Conn.sync({ force: true }).then(()=> {
//
// });

export default Conn;
