import {Message} from 'react-native-gifted-chat';

export const NotificationData = [
  {
    id: 1,
    title: '',
    message: 'Bus will reach  at 08:0',
    timeWhenArrived: '1 day ago',
  },
  {
    id: 2,
    title: '',
    message: 'Your Bus is Approaching!',
    timeWhenArrived: '1 day ago',
  },
  {
    id: 3,
    title: 'Driver',
    message:
      'Adventure calling! Stay in the loop with real-time updates on your favorite outdoor activities.',
    timeWhenArrived: '1 day ago',
    new: true,
  },
  {
    id: 4,
    title: '',
    message:
      'Adventure calling! Stay in the loop with real-time updates on your favorite outdoor activities',
    timeWhenArrived: '1 day ago',
  },
];

export const updateGuardianDropdown = [
  {key: '1', value: 'Parent'},
  {key: '2', value: 'Guardian'},
  {key: '3', value: 'Relative'},
  {key: '4', value: 'Family Friend'},
  {key: '5', value: 'Other'},
];

export const leaveDropdownData = [
  {key: '1', value: 'All Week'},
  {key: '2', value: 'Single Day'},
  {key: '3', value: 'AM'},
  {key: '4', value: 'PM'},
];

export const DegreeData = [
  {key: '1', value: 'Computer Science'},
  {key: '2', value: 'Mechanical'},
  {key: '3', value: 'Mechatronics'},
  {key: '4', value: 'Electrical'},
];
export const HighSchoolData = [
  {key: '1', value: 'St. Joseph'},
  {key: '2', value: 'St. Michael'},
  {key: '3', value: 'St. Hey'},
  {key: '4', value: 'St. Ho'},
];

export const tripData = [
  {
    title: 'TRIP 1',
    time: '8:30 AM',
    date: '28/MAR/24',
    start_location: 'Hoover Elementary School',
    end_location: 'WI State Capital',
    trip_no: '2346677',
    trip_plan: [
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'Hoover Elementary School',
        location: '950 Hunt Ave Neenah, WI 54956',
        status: 'Pre-Trip',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'Hoover Elementary School',
        location: '950 Hunt Ave Neenah, WI 54956',
        status: 'Spot',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'WI State Capital',
        location: '2E. Main St Madison, WI 53703',
        status: 'Dropoff',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'WI State Capital',
        location: '2E. Main St Madison, WI 53703',
        status: 'Pickup',
      },
    ],
  },
  {
    title: 'TRIP 2',
    time: '8:30 AM',
    date: '28/MAR/24',
    start_location: 'Hoover Elementary School',
    end_location: 'WI State Capital',
    trip_no: '2346677',
    trip_plan: [
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'Hoover Elementary School',
        location: '950 Hunt Ave Neenah, WI 54956',
        status: 'Pre-Trip',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'Hoover Elementary School',
        location: '950 Hunt Ave Neenah, WI 54956',
        status: 'Spot',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'WI State Capital',
        location: '2E. Main St Madison, WI 53703',
        status: 'Dropoff',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'WI State Capital',
        location: '2E. Main St Madison, WI 53703',
        status: 'Pickup',
      },
    ],
  },
  {
    title: 'TRIP 3',
    time: '8:30 AM',
    date: '28/MAR/24',
    start_location: 'Hoover Elementary School',
    end_location: 'WI State Capital',
    trip_no: '2346677',
    trip_plan: [
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'Hoover Elementary School',
        location: '950 Hunt Ave Neenah, WI 54956',
        status: 'Pre-Trip',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'Hoover Elementary School',
        location: '950 Hunt Ave Neenah, WI 54956',
        status: 'Spot',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'WI State Capital',
        location: '2E. Main St Madison, WI 53703',
        status: 'Dropoff',
      },
      {
        time: '8:30 AM',
        date: '28/MAR/24',
        title: 'WI State Capital',
        location: '2E. Main St Madison, WI 53703',
        status: 'Pickup',
      },
    ],
  },
];

export const studentsData = [
  {
    name: 'Jane Cooper',
    image: require('../assets/images/child1.jpg'),
    age: 5,
    emergency_contact: '8978675634',
    school_name: 'Oakwood Elementary School',
    transportation_preference: 'Van',
    medical_details: 'Oakwood Elementary School',
    guardians: [
      {
        name: 'Jacob Jones',
        relation: 'Uncle',
        phone_number: 'Phone Number',
      },
      {
        name: 'Sarah Jones',
        relation: 'Aunt',
        phone_number: '8978675634',
      },
    ],
  },
  {
    name: 'Jacob Jones',
    image: require('../assets/images/child2.jpg'),
    age: 6,
    emergency_contact: '8978675634',
    school_name: 'Oakwood Elementary School',
    transportation_preference: 'Van',
    medical_details: 'Oakwood Elementary School',
    guardians: [
      {
        name: 'Jacob Jones',
        relation: 'Uncle',
        phone_number: 'Phone Number',
      },
      {
        name: 'Sarah Jones',
        relation: 'Aunt',
        phone_number: '8978675634',
      },
    ],
  },
  {
    name: 'Kathryn Murphy',
    image: require('../assets/images/child3.jpg'),
    age: 5,
    emergency_contact: '8978675634',
    school_name: 'Oakwood Elementary School',
    transportation_preference: 'Van',
    medical_details: 'Oakwood Elementary School',
    guardians: [
      {
        name: 'Jacob Jones',
        relation: 'Uncle',
        phone_number: 'Phone Number',
      },
      {
        name: 'Sarah Jones',
        relation: 'Aunt',
        phone_number: '8978675634',
      },
    ],
  },
  {
    name: 'Theresa Webb',
    image: require('../assets/images/child4.jpg'),
    age: 6,
    emergency_contact: '8978675634',
    school_name: 'Oakwood Elementary School',
    transportation_preference: 'Van',
    medical_details: 'Oakwood Elementary School',
    guardians: [
      {
        name: 'Jacob Jones',
        relation: 'Uncle',
        phone_number: 'Phone Number',
      },
      {
        name: 'Sarah Jones',
        relation: 'Aunt',
        phone_number: '8978675634',
      },
    ],
  },
];

export const chats_data = [
  {
    title: 'Marie Moores',
    message: 'Hi, Marie Moores',
    time: '08:43',
  },
  {
    title: 'Bobby Langford',
    message: 'Will do, super, thank you',
    time: 'Mon',
  },
  {
    title: 'William Wiles',
    message: 'Uploaded file.',
    time: '08:43',
  },
  {
    title: 'James Edelen',
    message: 'Here is another tutorial, if you...',
    time: 'Tue',
  },
  {
    title: 'Jose Farmer',
    message: 'Here is another tutorial, if you...',
    time: '08:43',
  },
  {
    title: 'Frank Marten',
    message: 'Here is another tutorial, if you...',
    time: 'Sun',
  },
  {
    title: 'Marzena Klasa',
    message: 'Will do, super, thank you',
    time: 'Fri',
  },
  {
    title: 'James Edelen',
    message: 'Here is another tutorial, if you...',
    time: '10:01',
  },
  {
    title: 'Jose Farmer',
    message: 'Will do, super, thank you',
    time: '01:56',
  },
  {
    title: 'Frank Marten',
    message: 'Here is another tutorial, if you...',
    time: '08:43',
  },
  {
    title: 'NYU STERN',
    message: 'Hi Bruce..',
    time: '08:43',
  },
  {
    title: 'Taft Public School',
    message: 'Here is another tutorial, if you...',
    time: 'Mon',
  },
  {
    title: 'Berkeley Haas',
    message: 'Will do, super, thank you',
    time: '08:43',
  },
];

export const childDropDown = [
  {
    title: 'Esther Tommay',
    image: require('../assets/images/profile_image.webp'),
  },
  {
    title: 'Cameron Tommay',
    image: require('../assets/images/child2.jpg'),
  },
  {
    title: 'Jhon Tommay',
    image: require('../assets/images/child3.jpg'),
  },
];
