const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {
  buildSchema
} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

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

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input EventInput{
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
  rootValue: {
    events: () => {
      return Event.find()
        .then(events => {
          return events.map(event => {
            return {
              ...event._doc,
              _id: event.id
            };
          });
        })
        .catch(err => {
          throw err;
        });
    },
    // resolver
    createEvent: args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5cef4b1d6fb7f93540027c5d'
      });
      let createdEvent;
      // store into memory aka events array
      //events.push(event);
      return event
        .save()
        .then(result => {
          createdEvent = {
            ...result._doc,
            _id: result._doc._id.toString()
          };
          return User.findById('5cef4b1d6fb7f93540027c5d')
        })
        .then(user => {
          if (!user) {
            throw new Error('User not found..');
          }
          user.createdEvents.push(event);
          return user.save();
        })
        .then(result => {
          return createdEvent;
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    }, //end of createEvents
    // used to store into the database
    createUser: args => {
      return User.findOne({
          email: args.userInput.email
        })
        .then(user => {
          if (user) {
            throw new Error('User exists already.');
          }
          return bcrypt
            .hash(args.userInput.password, 12);
        })
        .then(hashPassword => {
          const user = new User({
            email: args.userInput.email,
            password: hashPassword
          });
          return user.save();
        })
        .then(result => {
          return {
            ...result._doc,
            password: null,
            _id: result.id
          };
        })
        .catch(err => {
          throw err;
        });
    }
  }, //root value
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
