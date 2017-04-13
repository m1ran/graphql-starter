import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLInputObjectType
} from 'graphql';
import Helper from './helper';

const User = new GraphQLObjectType({
  name: 'User',
  description: 'Display users',
  fields: () => {
    return {
      id: {
        type: GraphQLInt,
        resolve(user) {
          return user.id;
        }
      },
      username: {
        type: GraphQLString,
        resolve(user) {
          return user.username;
        }
      },
      cursor: {
        type: GraphQLString,
        resolve(user) {
          return new Buffer(user.id + ':').toString('base64');
        }
      },
      customer: {
        type: Customer,
        args: {
          customerId: {
            type: GraphQLString
          }
        },
        resolve: (user, args, {loaders}) => {
          return loaders.customer.load(user.dataValues.customerId)
        }
      }
    }
  }
});

const UserData = new GraphQLInputObjectType({
  name: 'UserData',
  description: 'User input data',
  fields: () => {
    return {
      username: {
        type: new GraphQLNonNull(GraphQLString)
      },
      password: {
        type: new GraphQLNonNull(GraphQLString)
      }
    }
  }
});

const Customer = new GraphQLObjectType({
  name: 'Customer',
  description: 'Display customers',
  fields: () => {
    return {
      id: {
        type: GraphQLString,
        resolve(customer) {
          return customer.id;
        }
      },
      account_balance: {
        type: GraphQLInt,
        resolve(customer) {
          return customer.account_balance;
        }
      }
    }
  }
});

const CustomerData = new GraphQLInputObjectType({
  name: 'CustomerData',
  description: 'Customer input data',
  fields: () => {
    return {
      account_balance: {
        type: new GraphQLNonNull(GraphQLInt)
      }
    }
  }
});

const Confirmation = new GraphQLObjectType({
  name: 'Confirmation',
  description: 'Display confirmation',
  fields: () => {
    return {
      id: {
        type: GraphQLString,
        resolve(confimation) {
          return confimation.id;
        }
      },
      deleted: {
        type: GraphQLBoolean,
        resolve(confimation) {
          return confimation.deleted;
        }
      }
    }
  }
});

const Login = new GraphQLObjectType({
  name: 'Login',
  description: 'Login user',
  fields: () => {
    return {
      token: {
        type: GraphQLString,
        resolve(token) {
          return token;
        }
      }
    }
  }
});

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'Root query',
  fields: () => {
    return {
      users: {
        type: new GraphQLList(User),
        args: {
          id: {
            type: GraphQLInt
          },
          username: {
            type: GraphQLString
          },
          first: {
            type: GraphQLInt
          },
          after: {
            type: GraphQLString
          }
        },
        resolve: (root, args) => Helper.getUsers(args)
      },
      customers: {
        type: new GraphQLList(Customer),
        args: {
          id: {
            type: GraphQLString
          },
          limit: {
            type: GraphQLInt
          }
        },
        resolve: (root, args) => Helper.getCustomers(args)
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Actions with user and customer',
  fields() {
    return {
      loginUser: {
        description: 'Login user',
        type: Login,
        args: {
          input: {
            type: new GraphQLNonNull(UserData)
          }
        },
        resolve: (_, args) => Helper.loginUser({
          username: args.input.username,
          password: args.input.password
        })
      },
      createUser: {
        description: 'Create new user, create customer and link user with customer',
        type: User,
        args: {
          input: {
            type: new GraphQLNonNull(UserData)
          }
        },
        resolve: (_, args) => Helper.createUser({
          username: args.input.username,
          password: args.input.password
        })
      },
      updateUser: {
        description: 'Update user',
        type: User,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          input: {
            type: new GraphQLNonNull(UserData)
          }
        },
        resolve: (_, args) => Helper.updateUser(args.id, {
          username: args.input.username,
          password: args.input.password
        })
      },
      deleteUser: {
        description: 'Delete user and delete customer linked with user',
        type: Confirmation,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        resolve: (_, args) => Helper.deleteUser(args.id)
      },
      createCustomer: {
        description: 'Create new customer',
        type: Customer,
        args: {
          input: {
            type: new GraphQLNonNull(CustomerData)
          }
        },
        resolve: (_, args) => Helper.createCustomer(args.input.account_balance)
      },
      updateCustomer: {
        description: 'Update customer',
        type: Customer,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          },
          input: {
            type: new GraphQLNonNull(CustomerData)
          }
        },
        resolve: (_, args) => Helper.updateCustomer(args.id, args.input.account_balance)
      },
      deleteCustomer: {
        description: 'Delete customer',
        type: Confirmation,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: (_, args) => Helper.deleteCustomer(args.id)
      }
    }
  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

export default Schema;
