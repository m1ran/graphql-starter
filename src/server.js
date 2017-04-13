import Express from 'express';
import DataLoader from 'dataloader';
import GraphqlHTTP from 'express-graphql';
import Schema from './data/schema';
import Helper from './data/helper';

// Config
const PORT = 4000;

const app = Express();

app.use('/graphql', GraphqlHTTP(req => {
  const customerLoader = new DataLoader(
    keys => Promise.all(keys.map(Helper.getUserCustomer))
  )

  const loaders = {
    customer: customerLoader
  }

  return {
    context: {loaders},
    schema: Schema,
    graphiql: true,
    pretty: true
  }
}));

app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
