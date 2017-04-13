import Faker from 'faker';
import JWT from 'jsonwebtoken';
import Db from './db';
import Stripe from './stripe';

const SECRET = 'qwerty';

export default class Helper {
  static getUsers(args) {
    let where = {},
      options = {
        order: [['id', 'ASC']]
      };
    for (let key in args) {
      if (key !== 'first' && key !== 'after') {
        where[key] = args[key];
      }
    }
    if (args.first && args.after) {
      let eq = where.id;
      let cursor = new Buffer(args.after, 'base64').toString();
      let id = parseInt(cursor.replace(':', ''));
      if (id > 0) {
        where.id = {
          $gt: id
        }
        if (eq) {
          where.id.$eq = eq;
        }
        options.limit = args.first;
      }
    }
    if (Object.keys(where).length) {
      options.where = where;
    }
    return Db.models.user.findAll(options);
  }

  static loginUser(user) {
    user.password = JWT.sign(user.password, SECRET);
    return Helper.getUsers(user).then((users) => {
      if (users.length) {
        let user = users[0];
        return JWT.sign({
          username: user.dataValues.username,
          password: user.dataValues.password
        }, SECRET);
      } else {
        return null;
      }
    });
  }

  static createUser(user) {
    user.password = JWT.sign(user.password, SECRET);
    // create customer
    return Helper.createCustomer(Faker.random.number(1000)).then((customer) => {
      user.customerId = customer.id;
      // create user
      return Db.models.user.create(user);
    });
  }

  static updateUser(id, user) {
    user.password = JWT.sign(user.password, SECRET);
    return Db.models.user.update(user, {
      where: {id: id}
    });
  }

  static deleteUser(id) {
    // get user customer
    return Helper.getUsers({id: id}).then((users) => {
      if (users.length) {
        let user = users[0];
        let customerId = user.dataValues.customerId;
        // delete customer
        if (customerId) {
          return Helper.deleteCustomer(customerId).then((confirmation) => {
            if (confirmation.deleted) {
              return Helper.deleteUserDB(id);
            } else {
              return Helper.confirm(id);
            }
          });
        } else {
          return Helper.deleteUserDB(id);
        }
      } else {
        return Helper.confirm(id);
      }
    });
  }

  static deleteUserDB(id) {
    return Db.models.user.destroy({
      where: {id: id}
    }).then(() => {
      return Helper.confirm(id, true);
    }).catch((err) => {
      return Helper.confirm(id);
    });
  }

  static getUserCustomer(customerId) {
    if (customerId) {
      return Helper.getCustomers({id: customerId}).then((customers) => {
        return customers.length ? customers[0] : null;
      }).catch((err) => {
        return null;
      });
    } else {
      return null;
    }
  }

  static getCustomers(args) {
    if (args.id) {
      return Stripe.customers.retrieve(args.id).then((customer) => {
        return [customer];
      }).catch((err) => {
        return [];
      });
    } else {
      let options = {};
      if (args.limit && args.limit > 0) {
        options.limit = args.limit;
      }
      return Stripe.customers.list(options).then((customers) => {
        return customers.data;
      }).catch((err) => {
        return [];
      });
    }
  }

  static createCustomer(account_balance) {
    return Stripe.customers.create({
      email: Faker.internet.email(),
      account_balance: account_balance
    }).then((customer) => {
      return customer;
    }).catch((err) => {
      return null;
    });
  }

  static updateCustomer(id, account_balance) {
    return Stripe.customers.update(id, {
      account_balance: account_balance
    }).then((customer) => {
      return customer;
    }).catch((err) => {
      return null;
    });
  }

  static deleteCustomer(id) {
    return Stripe.customers.del(id).then((confirmation) => {
      return confirmation;
    }).catch((err) => {
      return {
        id: id,
        deleted: false
      };
    });
  }

  static confirm(id, deleted = false) {
    return {
      id: id,
      deleted: deleted
    }
  }
}
