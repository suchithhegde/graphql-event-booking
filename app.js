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
app.get('/', (req, res, next) => {
  res.send('Hello World!!');
})

app.use(bodyParser.json());

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
    app.listen(3000, () => console.log('Listening on port 3000.....'));
  })
  .catch(err => {
    console.log(err);
  });
