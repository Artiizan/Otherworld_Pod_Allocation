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

  // Order bookings by start date, then the number of clients and then the session duration to maximise utilization
  // TODO: Figure out how to handle the 5+6 clients is better than 10 clients scenario
  var bookings = options.bookings.sort((x, y) =>
  x.startDate > y.startDate ? 1 : -1 && x.vr.count < y.vr.count ? 1 : -1 && x.vr.duration < y.vr.duration ? 1 : -1
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
      console.warn(
        "Booking cannot be allocated with current rules: " +
          JSON.stringify(booking)
      );
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
            .toDate() > startDate
      ).length == 0
  );

  // Checks that the session will complete and swap over before an existing booking starts
  podsWithAvailability = podsWithAvailability.filter(
    (pod) =>
      pod.allocations.filter(
        (allocation) =>
          moment(allocation.endDate)
            .add(changeOverTime as moment.DurationInputArg1, "minutes") // Adds changeover time
            .toDate()! <= startDate ||
          allocation.startDate! >=
            moment(startDate)
              .add(duration as moment.DurationInputArg1, "minutes") // Adds Session length
              .add(changeOverTime as moment.DurationInputArg1, "minutes") // Adds changeover time
              .toDate()
      ).length == pod.allocations.length
  );

  if (podsWithAvailability.length > 0) {
    podsWithAvailability.forEach((pod) => {
      availablePods.push(pod);
    });
  }

  // Order pods by number to allocate larger groups next to each other
  // TODO: Consider spreading out the wear on pods slightly more to avoid over utilisation of the first few pods
  availablePods.sort((x, y) => (x.pod > y.pod ? 1 : -1));
  return availablePods;
};

//#endregion

//#region Dummy Data and Test Method

/* DUMMY CODE */

// Dummy list of Bookings for testing methods
// const now = moment();
// const bookings: Booking[] = [
//   {
//     _id: "a",
//     startDate: now.toDate(),
//     vr: {
//       duration: 30,
//       count: 1,
//     },
//   },
//   {
//     _id: "b",
//     startDate: now.add(35, "minutes").toDate(),
//     vr: {
//       duration: 30,
//       count: 1,
//     },
//   },
//   {
//     _id: "c",
//     startDate: now.add(20, "minutes").toDate(),
//     vr: {
//       duration: 20,
//       count: 4,
//     },
//   },
//   {
//     _id: "d",
//     startDate: now.add(10, "minutes").toDate(),
//     vr: {
//       duration: 35,
//       count: 8,
//     },
//   },
//   {
//     _id: "e",
//     startDate: now.add(65, "minutes").toDate(),
//     vr: {
//       duration: 26,
//       count: 3,
//     },
//   },
//   {
//     _id: "f",
//     startDate: now.add(65, "minutes").toDate(),
//     vr: {
//       duration: 60,
//       count: 5,
//     },
//   },
// ];

// Production Bookings Test Data
export const bookings = [
  {
    _id: "60c4cdd311a5940031886a20",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T15:00:00.000+0000"),
  },
  {
    _id: "60ce50ad94db3600323ba0bd",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T15:00:00.000+0000"),
  },
  {
    _id: "60d398dc6fc6060029c2d035",
    vr: {
      count: 5,
      duration: 55,
    },
    startDate: new Date("2021-07-01T15:00:00.000+0000"),
  },
  {
    _id: "60d89796e654e4003c993e8b",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T15:00:00.000+0000"),
  },
  {
    _id: "60c11ed311a5940031880345",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T15:15:00.000+0000"),
  },
  {
    _id: "60d48672417ef500364a5a7f",
    vr: {
      count: 6,
      duration: 70,
    },
    startDate: new Date("2021-07-01T15:45:00.000+0000"),
  },
  {
    _id: "60c658d794db36003238f774",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T16:00:00.000+0000"),
  },
  {
    _id: "60d0e93f94db3600323c4b1e",
    vr: {
      count: 3,
      duration: 55,
    },
    startDate: new Date("2021-07-01T16:30:00.000+0000"),
  },
  {
    _id: "60d2685994db3600323c9cf6",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T16:30:00.000+0000"),
  },
  {
    _id: "60aa8bbd94db36003230338c",
    vr: {
      count: 4,
      duration: 70,
    },
    startDate: new Date("2021-07-01T17:00:00.000+0000"),
  },
  {
    _id: "60dc5fb289d43c002ef98d35",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T17:00:00.000+0000"),
  },
  {
    _id: "60dcb7a289d43c002ef9abec",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T17:00:00.000+0000"),
  },
  {
    _id: "60940e9f0058740027a56fd7",
    vr: {
      count: 5,
      duration: 70,
    },
    startDate: new Date("2021-07-01T17:30:00.000+0000"),
  },
  {
    _id: "60a974d294db3600322fd596",
    vr: {
      count: 2,
      duration: 70,
    },
    startDate: new Date("2021-07-01T18:00:00.000+0000"),
  },
  {
    _id: "60cda25f94db3600323b4908",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T18:00:00.000+0000"),
  },
  {
    _id: "60abe93c94db36003230e53d",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T18:15:00.000+0000"),
  },
  {
    _id: "60d0fcf011a59400318c9fb9",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T18:30:00.000+0000"),
  },
  {
    _id: "60d4af5885cb01003c85c54a",
    vr: {
      count: 4,
      duration: 70,
    },
    startDate: new Date("2021-07-01T18:45:00.000+0000"),
  },
  {
    _id: "60d096ec11a59400318c2994",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T19:00:00.000+0000"),
  },
  {
    _id: "60d87407d62c0100370557cd",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T19:00:00.000+0000"),
  },
  {
    _id: "60d89dcce654e4003c993f15",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T19:15:00.000+0000"),
  },
  {
    _id: "60d9964c26e10500280fe4a2",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T19:15:00.000+0000"),
  },
  {
    _id: "60d27b1b11a59400318d3467",
    vr: {
      count: 11,
      duration: 55,
    },
    startDate: new Date("2021-07-01T20:00:00.000+0000"),
  },
  {
    _id: "60d27b3511a59400318d3498",
    vr: {
      count: 11,
      duration: 55,
    },
    startDate: new Date("2021-07-01T20:00:00.000+0000"),
  },
  {
    _id: "60d642a1e654e4003c98f540",
    vr: {
      count: 3,
      duration: 55,
    },
    startDate: new Date("2021-07-01T20:00:00.000+0000"),
  },
  {
    _id: "60d49d5e0ed2600030211185",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
  },
  {
    _id: "60d7dcfcd62c010037054a22",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
  },
  {
    _id: "60d8d9bbd62c01003705751a",
    vr: {
      count: 4,
      duration: 55,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
  },
  {
    _id: "60da3e0f89d43c002ef92a73",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
  },
  {
    _id: "60db210389d43c002ef94056",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
  },
  {
    _id: "60dc342489d43c002ef97af6",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
  },
  {
    _id: "60dcb6e689d43c002ef9ab13",
    vr: {
      count: 2,
      duration: 55,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
  },
  {
    _id: "60dd7a1e89d43c002ef9b8db",
    vr: {
      count: 2,
      duration: 40,
    },
    startDate: new Date("2021-07-01T21:00:00.000+0000"),
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
