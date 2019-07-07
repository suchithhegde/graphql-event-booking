const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth');
const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');

const app = express();
// not needed since storing into mongoose
//const events = [];

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

// changes need to be made here for any proprietary updates
app.use('/graphql', graphqlHttp({
  schema: graphQLSchema,
  rootValue: graphQLResolvers, //root value
  graphiql: true

})); //app.use
// connect to mongoose db 11.01
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@prft-cluster-a4xjn.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`, {
    useNewUrlParser: true
  }).then(() => {
    app.listen(8000, () => console.log('Listening backend on port 8000.....'));
  })
  .catch(err => {
    console.log(err);
  });
