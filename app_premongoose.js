const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();
// not needed since storing into mongoose
//const events = [];

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.send('Hello World!!');
})
// changes need to be made here for any proprietary updates
app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input EventInput{
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
      }
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
  rootValue: {
    events: () => {
      return events;
    },
    // resolver
    createEvent: (args) => {
      // const event = {
      //   _id: Math.random().toString(),
      //   title: args.eventInput.title,
      //   description: args.eventInput.description,
      //   price: +args.eventInput.price,
      //   date: args.eventInput.date
      // };
      const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
      });

     // store into memory aka events array
     //events.push(event);
     return event
        .save()
        .then(result => {
          console.log(result);
          return { ...result._doc};
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    }
  },
  graphiql: true

})
);
// connect to mongoose db 11.01
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@prft-cluster-a4xjn.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,{ useNewUrlParser: true }
).then(() => {
  app.listen(3000, () => console.log('Listening on port 3000.....'));
})
.catch(err => {
  console.log(err);
});
