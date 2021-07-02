import moment from "moment";

//#region Custom Type Definitions

// Input Array of Bookings
type Booking = {
  _id: string;
  startDate: Date; // when the booking starts
  vr: {
    duration: number; // how long the booking lasts
    count: number; // how many people
  };
};

// Input Options
type AllocateBookingsOptions = {
  podCount: number;
  changeOverTime: number;
  bookings: Booking[];
};

type Allocation = {
  startDate: Date;
  endDate: Date;
  bookingId: Booking["_id"];
};

type Pod = {
  pod: number;
  allocations: Allocation[];
};

//#endregion

/** Allocate pods to bookings.
 * @param {Object} options - The options object.
 * @param {Number} options.podCount - The number of pods in the facility.
 * @param {Number} options.changeOverTime - How many minutes to leave between sessions.
 * @param {Booking[]} options.bookings - An array of booking objects.
 */
const allocateBookings = (options: AllocateBookingsOptions): Pod[] => {
  // Variable Declaration
  const pods = initPods(options.podCount);
  var totalBookings = 0;
  var allocatedBookings = 0;

  // Order bookings by number of clients to maximise utilization
  // TODO: Figure out how to handle the 5+6 clients is better than 10 clients scenario
  var bookings = options.bookings.sort((x, y) =>
    x.vr.count < y.vr.count ? 1 : -1
  );

  // Iterate through bookings to make allocations
  bookings.forEach((booking) => {
    totalBookings += booking.vr.count;
    const availablePods = getAvailablePods(
      pods,
      booking.startDate,
      booking.vr.duration,
      options.changeOverTime
    );
    if (availablePods.length >= booking.vr.count) {
      // There are enough pods available at that time slot to accomodate the booking
      for (let i = 0; i < booking.vr.count; i++) {
        let allocation: Allocation = {
          startDate: booking.startDate,
          endDate: moment(booking.startDate)
            .add(booking.vr.duration as moment.DurationInputArg1, "minutes") // Adds Session length
            .toDate(),
          bookingId: booking._id,
        };

        // Adding Allocations to Pods
        var assignedPod = availablePods[0];
        availablePods.shift(); // Remove the assigned pod
        pods[assignedPod.pod - 1].allocations.push(allocation); // Add allocation to the Pod

        allocatedBookings++;
      }
    } else {
      console.log("Booking cannot be allocated with current rules: " + booking);
    }
  });

  console.log("Total bookings: " + totalBookings);
  console.log("Total bookings allocated: " + allocatedBookings);
  return pods;
};

//#region Helper Methods

/** Initialise empty pods to be booked.
 * @param {Number} podCount The number of pods to initialise.
 */
const initPods = (podCount: number): Pod[] => {
  const pods = [];
  for (let i = 1; i <= podCount; i++) {
    pods.push({
      pod: i,
      allocations: [],
    });
  }
  return pods;
};

/** Get list of available pods for that time frame
 * @param {Pod} pods - The current state of pods
 * @param {Date} startDate - Start Date of filter
 * @param {Number} duration - Length of booked session in minutes
 * @param {Number} changeOverTime - How many minutes to leave between sessions.
 */
const getAvailablePods = (
  pods: Pod[],
  startDate: Date,
  duration: Number,
  changeOverTime: Number
): Pod[] => {
  let availablePods: Pod[] = [];

  // Checks that the startDate is not during any of the current bookings for that pod
  var podsWithAvailability = pods.filter(
    (pod) =>
      pod.allocations.filter(
        (allocation) =>
          allocation.startDate <= startDate &&
          moment(allocation.endDate)
            .add(changeOverTime as moment.DurationInputArg1, "minutes") // Adds changeover time
            .toDate() >= startDate
      ).length == 0
  );

  // Checks that all sessions in the pod are done and swapped over before this one starts
  podsWithAvailability = podsWithAvailability.filter(
    (pod) =>
      pod.allocations.filter(
        (allocation) =>
          allocation.endDate >=
          moment(startDate)
            .add(duration as moment.DurationInputArg1, "minutes") // Adds Session length
            .add(changeOverTime as moment.DurationInputArg1, "minutes") // Adds changeover time
            .toDate()
      ).length == 0
  );

  if (podsWithAvailability.length > 0) {
    podsWithAvailability.forEach((pod) => {
      availablePods.push(pod);
    });
  }

  // Order pods by number to allocate larger groups next to each other
  availablePods.sort((x, y) => (x.pod > y.pod ? 1 : -1));
  return availablePods;
};

//#endregion

//#region Dummy Data and Test Method

/* DUMMY CODE */
const now = moment();
// Dummy list of Bookings for testing methods
const bookings: Booking[] = [
  {
    _id: "a",
    startDate: now.toDate(),
    vr: {
      duration: 30,
      count: 1,
    },
  },
  {
    _id: "b",
    startDate: now.add(35, "minutes").toDate(),
    vr: {
      duration: 30,
      count: 1,
    },
  },
  {
    _id: "c",
    startDate: now.add(20, "minutes").toDate(),
    vr: {
      duration: 20,
      count: 4,
    },
  },
  {
    _id: "d",
    startDate: now.add(10, "minutes").toDate(),
    vr: {
      duration: 35,
      count: 8,
    },
  },
  {
    _id: "e",
    startDate: now.add(65, "minutes").toDate(),
    vr: {
      duration: 26,
      count: 3,
    },
  },
  {
    _id: "f",
    startDate: now.add(65, "minutes").toDate(),
    vr: {
      duration: 60,
      count: 5,
    },
  },
];

const pods = allocateBookings({
  podCount: 14,
  changeOverTime: 5,
  bookings,
});

console.log(pods);

/* we'll run some real data (including overbooking scenarios!)
through the function and test the allocations output */

//#endregion
