const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

// begin fucntions
const events = async eventIds => {
  try {
    const events = await Event
      .find({
        _id: {
          $in: eventIds
        }
      })
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

// end functions
module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch (err) {
      throw err;
    }
  },
  // resolver
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5cf59436c6e3b16ea0fe58d9'
    });
    let createdEvent;
    // store into memory aka events array
    //events.push(event);
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await User.findById('5cf59436c6e3b16ea0fe58d9');
      if (!creator) {
        throw new Error('User not found..');
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }, //end of createEvents
  // used to store into the database
  createUser: async args => {
try {
    const existingUser = await User.findOne({
      email: args.userInput.email
    });
    if (existingUser) {
      throw new Error('User exists already.');
    }
    const hashedPassword = await bcrypt
      .hash(args.userInput.password, 12);

    const user = new User({
      email: args.userInput.email,
      password: hashedPassword
    });
    const result = await user.save();

return { ...result._doc, password: null, _id: result.id };
} catch (err) {
  throw err;
}
}
};
