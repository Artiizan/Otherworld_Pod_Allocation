# Otherworld Bookings Pod Allocation

Pod Allocation is a typescript project for determining the best assignment of bookings made at specific time slots for a predetermined period (in minutes) and a number of people. Written as a challenge presented by [Otherworld](https://other.world).

## Installation & Usage

### Package Installation

Use the node package manager [npm](https://docs.npmjs.com/cli/v7/configuring-npm/install) to install requirements to build the project.

```bash
npm install
```

### Requirements
- typescript `v4.3.4^`
- node.js `v12.19.0^`

### Usage

To run the project with the dummy data:

```bash
npm start
```

## Data Structures
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
- Output result should be an array of pod objects for the provided input data, in the following format:
```javascript
type Pod = {
  pod: number;
  allocations: Allocation[];
};

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

## Assumptions and Theories
### Self Made Assumptions
- Bookings of larger groups and longer times are more profitable and as such should be prioritised in all scenarios in order to maximise occupancy during overbooking. <br>
    - Simple solution is to order the input array of bookings by the group size.<br>
    However this might not be optimal as a combination of 6+5 people bookings might be better than a 10 person booking. Unless there is a group of two, alot of possible layers to the logic.
- Pods array will be written to another storage mechanism in order to allow in store staff to pull up the allocations and know which pods to send the clients to.

### Thoughts 
- Is it possible to start an overbooked booking a few minutes later is better than not allocating a slot to those clients. Provided it does not cause a knock on effect.

## Future Enhancements
1. Another way to handle bookings that cannot be accomodated, perhaps suggestions of other available times.
1. Spreading out allocation on pods to ensure there is not over utilisation of one and emptiness in another (longevity of components)
1. Attempt to delay larger overbooked bookings by a few minutes in order to facilitate them rather than turn them away (requires a far more in depth model and decision tree to avoid a knockon effect (possible use case for a Machine Learning model for each days bookings, compared to a perfect scenario))

## Contributions

- **Scaffold**: Written and provided by [Chris Adams](mailto:chris@thedreamcorporation.com) at Otherworld
- **Business Logic, Documentation and Solution**: Written and maintained by [Brandon Grant](mailto:brandon.kevin.grant@gmail.com)