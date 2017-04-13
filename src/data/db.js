import Sequelize from 'sequelize';

const Conn = new Sequelize(
  'graphql',
  'root',
  '',
  {
    dialect: 'mysql',
    host: 'localhost'
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
