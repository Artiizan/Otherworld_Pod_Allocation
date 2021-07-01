# Otherworld Bookings Pod Allocation

Pod Allocation is a typescript project for determining the best assignment of bookings made at specific time slots for a predetermined period (in minutes) and a number of people. Written as a challenge presented by [Otherworld](https://other.world).

## Package Installation

Use the node package manager [npm](https://docs.npmjs.com/cli/v7/configuring-npm/install) to install requirements to build the project.

```bash
npm install
```

## Usage

To run the project with the dummy data:

```bash
npm start
```

## Solution Assumptions
- Input data will be provided from multiple bookings sources in a unified format:
```javascript
type Booking = {
    _id: string,
    startDate: Date, // when the booking starts
    vr: {
        duration: number, // how long the booking lasts
        count: number, // how many people
    }
}
```
- Output result should be an array of allocated bookings for the provided input data, in the following format:
```javascript
type Allocation = {
    startDate: Date,
    endDate: Date,
    bookingId: Booking['_id'],
}
```
- Goal is to allocate bookings from input array to specific pods in a way that:
    - Ensures groups are not split up
    - There is sufficient "swap over time" inbetween sessions
    - Overbooking scenarios are handled in some way
        - Maxmimise pod occupancy and wait times for overbooked customers

## Contributions

- **Scaffold**: Written and provided by [Chris Adams](mailto:chris@thedreamcorporation.com) at Otherworld
- **Business Logic, Documentation and Solution**: Written and maintained by [Brandon Grant](mailto:brandon.kevin.grant@gmail.com)