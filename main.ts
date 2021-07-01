import moment from 'moment'

type Booking = {
    _id: string,
    startDate: Date, // when the booking starts
    vr: {
        duration: number, // how long the booking lasts
        count: number, // how many people
    }
}

type Allocation = {
    startDate: Date,
    endDate: Date,
    bookingId: Booking['_id'],
}

type Pod = {
    pod: number,
    allocations: Allocation[],
}

/**
 * Initialise empty pods to be booked.
 * @param {Number} podCount The number of pods to initialise.
 */
const initPods = (podCount: number): Pod[] => {
    const pods = []
    for (let i = 1; i <= podCount; i++) {
        pods.push({
            pod: i,
            allocations: [],
        })
    }
    return pods
}

type AllocateBookingsOptions = {
    podCount: number,
    changeOverTime: number,
    bookings: Booking[],
}

/**
 * Allocate pods to bookings.
 * @param {Object} options - The options object.
 * @param {Number} options.podCount - The number of pods in the facility.
 * @param {Number} options.changeOverTime - How many minutes to leave between sessions.
 * @param {Booking[]} options.bookings - An array of booking objects.
 */
const allocateBookings = (options: AllocateBookingsOptions): Allocation[] => {
    const pods = initPods(options.podCount)
    const allocations: Allocation[] = []

    /* insert your logic here */

    return allocations
}



/* DUMMY CODE */
const now = moment()
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
        startDate: now.add(35, 'minutes').toDate(),
        vr: {
            duration: 30,
            count: 1,
        },
    },
    {
        _id: "c",
        startDate: now.add(20, 'minutes').toDate(),
        vr: {
            duration: 20,
            count: 4,
        },
    },
    {
        _id: "d",
        startDate: now.add(10, 'minutes').toDate(),
        vr: {
            duration: 35,
            count: 8,
        },
    },
    {
        _id: "e",
        startDate: now.add(65, 'minutes').toDate(),
        vr: {
            duration: 26,
            count: 3,
        },
    },
    {
        _id: "f",
        startDate: now.add(65, 'minutes').toDate(),
        vr: {
            duration: 60,
            count: 5,
        },
    },
]

const allocations = allocateBookings({
    podCount: 14,
    changeOverTime: 5,
    bookings,
})

console.log(allocations)

/* we'll run some real data (including overbooking scenarios!)
through the function and test the allocations output */
