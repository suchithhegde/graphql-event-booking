const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./merge');


module.exports = {
  // resolver
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },
  // used to store into the database
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({
      _id: args.eventId
    });
    const booking = new Booking({
      user: '5cf59436c6e3b16ea0fe58d9',
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({
        _id: args.bookingId
      });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
