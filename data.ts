import { Route, Vehicle, RevenueData, PassengerVolumeData, Kpi, Report, User } from './types';

export const users: User[] = [
  { id: 'user123', reputation: 'Trusted' },
  { id: 'user456', reputation: 'Regular' },
  { id: 'user789', reputation: 'Newbie' },
];

export const routes: Route[] = [
  { 
    id: 'R01', 
    name: 'Bus #21G', 
    from: 'T. Nagar', 
    to: 'Marina Beach', 
    stops: ['T. Nagar', 'Saidapet', 'Guindy', 'Adyar', 'Mylapore', 'Marina Beach'], 
    stopsCoords: [
        { lat: 13.042, lng: 80.236 },
        { lat: 13.021, lng: 80.228 },
        { lat: 13.007, lng: 80.216 },
        { lat: 13.004, lng: 80.255 },
        { lat: 13.033, lng: 80.270 },
        { lat: 13.053, lng: 80.282 }
    ],
    averageEta: 45, 
    fare: 15 
  },
  { 
    id: 'R02', 
    name: 'Bus #47D', 
    from: 'Guindy', 
    to: 'Anna Nagar', 
    stops: ['Guindy', 'Ekkattuthangal', 'Ashok Nagar', 'Vadapalani', 'Koyambedu (CMBT)', 'Thirumangalam', 'Anna Nagar'], 
    stopsCoords: [
        { lat: 13.007, lng: 80.216 },
        { lat: 13.023, lng: 80.205 },
        { lat: 13.037, lng: 80.212 },
        { lat: 13.049, lng: 80.210 },
        { lat: 13.073, lng: 80.193 },
        { lat: 13.085, lng: 80.198 },
        { lat: 13.087, lng: 80.211 }
    ],
    averageEta: 55, 
    fare: 20 
  },
  { 
    id: 'R03', 
    name: 'Train MRTS', 
    from: 'Chennai Central', 
    to: 'Velachery', 
    stops: ['Chennai Central', 'Chennai Beach', 'Chintadripet', 'Light House', 'Mylapore', 'Thiruvanmiyur', 'Taramani', 'Velachery'], 
    stopsCoords: [
        { lat: 13.0827, lng: 80.2707 },
        { lat: 13.0898, lng: 80.2882 },
        { lat: 13.0760, lng: 80.2750 },
        { lat: 13.0470, lng: 80.2800 },
        { lat: 13.0330, lng: 80.2700 },
        { lat: 12.9900, lng: 80.2590 },
        { lat: 12.9790, lng: 80.2440 },
        { lat: 12.9710, lng: 80.2200 }
    ],
    averageEta: 50, 
    fare: 10 
  },
  { 
    id: 'R04', 
    name: 'Bus #G18', 
    from: 'Airport (MAA)', 
    to: 'Koyambedu (CMBT)', 
    stops: ['Airport (MAA)', 'Meenambakkam', 'Guindy', 'Ashok Nagar', 'Vadapalani', 'Koyambedu (CMBT)'], 
    stopsCoords: [
        { lat: 12.994, lng: 80.170 },
        { lat: 12.988, lng: 80.180 },
        { lat: 13.007, lng: 80.216 },
        { lat: 13.037, lng: 80.212 },
        { lat: 13.049, lng: 80.210 },
        { lat: 13.073, lng: 80.193 }
    ],
    averageEta: 65, 
    fare: 35 
  },
  {
    id: 'R05',
    name: 'Bus #570 Express',
    from: 'Koyambedu (CMBT)',
    to: 'Siruseri IT Park',
    stops: ['Koyambedu (CMBT)', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Velachery', 'Perungudi', 'Karapakkam', 'Sholinganallur (OMR)', 'Navalur', 'Siruseri IT Park'],
    stopsCoords: [
        { lat: 13.073, lng: 80.193 },
        { lat: 13.049, lng: 80.210 },
        { lat: 13.037, lng: 80.212 },
        { lat: 13.007, lng: 80.216 },
        { lat: 12.971, lng: 80.220 },
        { lat: 12.960, lng: 80.240 },
        { lat: 12.920, lng: 80.230 },
        { lat: 12.900, lng: 80.228 },
        { lat: 12.850, lng: 80.225 },
        { lat: 12.820, lng: 80.220 }
    ],
    averageEta: 75,
    fare: 40
  },
  {
    id: 'R06',
    name: 'Bus #70V',
    from: 'Koyambedu (CMBT)',
    to: 'Tambaram',
    stops: ['Koyambedu (CMBT)', 'Vadapalani', 'Guindy', 'Airport (MAA)', 'Pallavaram', 'Chromepet', 'Tambaram'],
    stopsCoords: [
        { lat: 13.073, lng: 80.193 },
        { lat: 13.049, lng: 80.210 },
        { lat: 13.007, lng: 80.216 },
        { lat: 12.994, lng: 80.170 },
        { lat: 12.968, lng: 80.155 },
        { lat: 12.951, lng: 80.140 },
        { lat: 12.925, lng: 80.117 }
    ],
    averageEta: 60,
    fare: 30
  },
  {
    id: 'R07',
    name: 'Chennai Metro Blue Line',
    from: 'Airport (MAA)',
    to: 'Central Metro',
    stops: ['Airport (MAA)', 'Meenambakkam', 'Alandur Metro', 'Guindy', 'Saidapet', 'Teynampet', 'Thousand Lights', 'Central Metro'],
    stopsCoords: [
        { lat: 12.994, lng: 80.170 },
        { lat: 12.988, lng: 80.180 },
        { lat: 13.004, lng: 80.201 },
        { lat: 13.007, lng: 80.216 },
        { lat: 13.021, lng: 80.228 },
        { lat: 13.042, lng: 80.245 },
        { lat: 13.060, lng: 80.258 },
        { lat: 13.0827, lng: 80.2707 }
    ],
    averageEta: 30,
    fare: 40
  },
  {
    id: 'R08',
    name: 'Bus #19D',
    from: 'Adyar',
    to: 'Sholinganallur (OMR)',
    stops: ['Adyar', 'Thiruvanmiyur', 'Taramani', 'Perungudi', 'Karapakkam', 'Sholinganallur (OMR)'],
    stopsCoords: [
        { lat: 13.004, lng: 80.255 },
        { lat: 12.990, lng: 80.259 },
        { lat: 12.979, lng: 80.244 },
        { lat: 12.960, lng: 80.240 },
        { lat: 12.920, lng: 80.230 },
        { lat: 12.900, lng: 80.228 }
    ],
    averageEta: 40,
    fare: 20
  },
  {
    id: 'R09',
    name: 'Suburban Rail (South Line)',
    from: 'Chennai Central',
    to: 'Tambaram',
    stops: ['Chennai Central', 'Egmore', 'Nungambakkam', 'Kodambakkam', 'T. Nagar', 'Saidapet', 'Guindy', 'Airport (MAA)', 'Chromepet', 'Tambaram'],
    stopsCoords: [
        { lat: 13.0827, lng: 80.2707 },
        { lat: 13.0782, lng: 80.2612 },
        { lat: 13.0620, lng: 80.2390 },
        { lat: 13.0510, lng: 80.2280 },
        { lat: 13.0420, lng: 80.2360 },
        { lat: 13.0210, lng: 80.2280 },
        { lat: 13.0070, lng: 80.2160 },
        { lat: 12.9940, lng: 80.1700 },
        { lat: 12.9510, lng: 80.1400 },
        { lat: 12.9250, lng: 80.1170 }
    ],
    averageEta: 45,
    fare: 15
  },
  {
    id: 'R10',
    name: 'Bus #54 Express',
    from: 'Broadway / Parrys',
    to: 'Poonamallee',
    stops: ['Broadway / Parrys', 'Chennai Central', 'Saidapet', 'Guindy', 'Porur', 'Poonamallee'],
    stopsCoords: [
        { lat: 13.088, lng: 80.288 },
        { lat: 13.0827, lng: 80.2707 },
        { lat: 13.021, lng: 80.228 },
        { lat: 13.007, lng: 80.216 },
        { lat: 13.035, lng: 80.158 },
        { lat: 13.048, lng: 80.091 }
    ],
    averageEta: 65,
    fare: 25
  }
];

export const vehicles: (LiveVehicle & { stickerCode: string })[] = [
  { 
    id: 'TN 01 N 1234', 
    stickerCode: 'MTC-21G-01',
    routeId: 'R01', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Adyar, Chennai', 
    coords: '13.004° N, 80.255° E',
    lat: 13.004, 
    lng: 80.255,
    driver: { name: 'Kumar Raja', phone: '+91 98765 43210' },
    routeDetails: {
        destination: 'Marina Beach',
        distance: '3 km',
        time: '10m',
        nextStop: 'Light House'
    },
    timeline: [
        { time: '4:35 PM', location: 'Adyar Signal', event: 'Resumed transit'},
        { time: '4:00 PM', location: 'Guindy Park', event: 'Passed stop'},
        { time: '3:44 PM', location: 'Saidapet', event: 'On time'},
    ]
  },
  { 
    id: 'TN 01 N 3456', 
    stickerCode: 'MTC-21G-02',
    routeId: 'R01', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Guindy, Chennai', 
    coords: '13.007° N, 80.216° E',
    lat: 13.007, 
    lng: 80.216,
    driver: { name: 'Meena Priya', phone: '+91 98765 43213' },
    routeDetails: {
        destination: 'Marina Beach',
        distance: '9 km',
        time: '25m',
        nextStop: 'Adyar'
    },
    timeline: [
        { time: '4:35 PM', location: 'Guindy Race Course', event: 'On time'},
    ]
  },
  { 
    id: 'TN 07 C 5678', 
    stickerCode: 'MTC-47D-01',
    routeId: 'R02', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Vadapalani, Chennai', 
    coords: '13.049° N, 80.210° E',
    lat: 13.049, 
    lng: 80.210,
    driver: { name: 'Suresh Kumar', phone: '+91 98765 43211' },
    routeDetails: {
        destination: 'Anna Nagar',
        distance: '5 km',
        time: '14m',
        nextStop: 'Koyambedu (CMBT)'
    },
    timeline: [
        { time: '3:15 PM', location: 'Vadapalani Signal', event: 'Departed stop'},
        { time: '3:00 PM', location: 'Ashok Nagar', event: 'On time'},
    ]
  },
  { 
    id: 'TN 07 C 9901', 
    stickerCode: 'MTC-47D-02',
    routeId: 'R02', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Guindy, Chennai', 
    coords: '13.007° N, 80.216° E',
    lat: 13.007, 
    lng: 80.216,
    driver: { name: 'Murugan V', phone: '+91 98765 43220' },
    routeDetails: {
        destination: 'Anna Nagar',
        distance: '12 km',
        time: '32m',
        nextStop: 'Ekkattuthangal'
    },
    timeline: [
        { time: '4:40 PM', location: 'Guindy Metro', event: 'Departed terminus'},
    ]
  },
  { 
    id: 'TN 09 G 7890', 
    stickerCode: 'MTC-G18-01',
    routeId: 'R04', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Meenambakkam, Chennai', 
    coords: '12.988° N, 80.180° E',
    lat: 12.988, 
    lng: 80.180,
    driver: { name: 'Vikram Selvam', phone: '+91 98765 43214' },
    routeDetails: {
        destination: 'Koyambedu (CMBT)',
        distance: '14 km',
        time: '35m',
        nextStop: 'Guindy'
    },
    timeline: [
        { time: '4:35 PM', location: 'Airport Terminal 1', event: 'Departed airport'},
    ]
  },
  { 
    id: 'TN 01 N 5701', 
    stickerCode: 'MTC-570-01',
    routeId: 'R05', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Velachery, Chennai', 
    coords: '12.971° N, 80.220° E',
    lat: 12.971, 
    lng: 80.220,
    driver: { name: 'Dhanush R', phone: '+91 98765 43221' },
    routeDetails: {
        destination: 'Siruseri IT Park',
        distance: '18 km',
        time: '40m',
        nextStop: 'Perungudi'
    },
    timeline: [
        { time: '4:42 PM', location: 'Velachery Bypass', event: 'On route OMR'},
    ]
  },
  { 
    id: 'TN 01 N 7001', 
    stickerCode: 'MTC-70V-01',
    routeId: 'R06', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Pallavaram, Chennai', 
    coords: '12.968° N, 80.155° E',
    lat: 12.968, 
    lng: 80.155,
    driver: { name: 'Karthik S', phone: '+91 98765 43222' },
    routeDetails: {
        destination: 'Tambaram',
        distance: '7 km',
        time: '18m',
        nextStop: 'Chromepet'
    },
    timeline: [
        { time: '4:45 PM', location: 'Pallavaram Flyover', event: 'Express Corridor'},
    ]
  },
  { 
    id: 'TN 01 N 1901', 
    stickerCode: 'MTC-19D-01',
    routeId: 'R08', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Taramani, Chennai', 
    coords: '12.979° N, 80.244° E',
    lat: 12.979, 
    lng: 80.244,
    driver: { name: 'Bala Subbu', phone: '+91 98765 43223' },
    routeDetails: {
        destination: 'Sholinganallur (OMR)',
        distance: '8 km',
        time: '20m',
        nextStop: 'Perungudi'
    },
    timeline: [
        { time: '4:40 PM', location: 'TIDEL Park', event: 'On time'},
    ]
  },
  { 
    id: 'TN 01 N 5401', 
    stickerCode: 'MTC-54-01',
    routeId: 'R10', 
    type: 'Bus', 
    status: 'On road', 
    location: 'Porur, Chennai', 
    coords: '13.035° N, 80.158° E',
    lat: 13.035, 
    lng: 80.158,
    driver: { name: 'Ganesh Nathan', phone: '+91 98765 43224' },
    routeDetails: {
        destination: 'Poonamallee',
        distance: '9 km',
        time: '22m',
        nextStop: 'Poonamallee'
    },
    timeline: [
        { time: '4:41 PM', location: 'Porur Junction', event: 'Heavy traffic cleared'},
    ]
  },
  { 
    id: 'TN METRO 101', 
    stickerCode: 'METRO-BLUE-01',
    routeId: 'R07', 
    type: 'Train', 
    status: 'On road', 
    location: 'Guindy Metro Station', 
    coords: '13.007° N, 80.216° E',
    lat: 13.007, 
    lng: 80.216,
    driver: { name: 'Pooja Sharma', phone: '+91 98765 43225' },
    routeDetails: {
        destination: 'Central Metro',
        distance: '10 km',
        time: '12m',
        nextStop: 'Saidapet'
    },
    timeline: [
        { time: '4:46 PM', location: 'Guindy Metro Platform 1', event: 'Doors closed'},
    ]
  },
  { 
    id: 'TN MRTS 9012', 
    stickerCode: 'MRTS-RAIL-01',
    routeId: 'R03', 
    type: 'Train', 
    status: 'On road', 
    location: 'Tiruvanmiyur Station', 
    coords: '12.990° N, 80.259° E',
    lat: 12.990, 
    lng: 80.259,
    driver: { name: 'Anil Das', phone: '+91 98765 43212' },
    routeDetails: {
        destination: 'Velachery',
        distance: '4 km',
        time: '8m',
        nextStop: 'Taramani'
    },
    timeline: [
        { time: '4:48 PM', location: 'Tiruvanmiyur Platform 2', event: 'Departed'},
    ]
  }
];

export const kpis: Kpi[] = [
    { title: 'Active Vehicles', value: '142', change: '+2', changeType: 'increase' },
    { title: 'Total Revenue (Today)', value: '₹45,231', change: '+5.2%', changeType: 'increase' },
    { title: 'On-Time Performance', value: '89%', change: '-1.5%', changeType: 'decrease' },
    { title: 'Tickets Sold', value: '3,120', change: '+150', changeType: 'increase' },
];

export const revenueData: RevenueData[] = [
  { month: 'Jan', revenue: 40000 },
  { month: 'Feb', revenue: 30000 },
  { month: 'Mar', revenue: 50000 },
  { month: 'Apr', revenue: 48000 },
  { month: 'May', revenue: 60000 },
  { month: 'Jun', revenue: 55000 },
];

export const passengerVolumeData: PassengerVolumeData[] = [
  { day: 'Mon', passengers: 2400 },
  { day: 'Tue', passengers: 2210 },
  { day: 'Wed', passengers: 2290 },
  { day: 'Thu', passengers: 2000 },
  { day: 'Fri', passengers: 2181 },
  { day: 'Sat', passengers: 2500 },
  { day: 'Sun', passengers: 1890 },
];

export const reports: Report[] = [
  {
    id: 'REP001',
    type: 'Traffic',
    location: 'Near Guindy Metro',
    time: '15m ago',
    description: '[Bus Code: MTC-21G-01] Heavy congestion near Guindy flyover. Bus moving slowly.',
    upvotes: 12,
    downvotes: 1,
    reporterId: 'user123',
    reporterName: 'Anand Sharma',
    reporterReputation: 'Trusted',
    vehicle_id: 'TN 01 N 1234',
    verified: true,
    isSynced: true,
    status: 'active'
  },
  {
    id: 'REP002',
    type: 'Breakdown',
    location: 'Vadapalani Flyover',
    time: '30m ago',
    description: '[Bus Code: MTC-47D-01] Engine issue reported on Bus #47D. Mechanics dispatched.',
    upvotes: 8,
    downvotes: 0,
    reporterId: 'user456',
    reporterName: 'Priya Sundaram',
    reporterReputation: 'Regular',
    vehicle_id: 'TN 07 C 5678',
    verified: true,
    isSynced: true,
    status: 'active'
  },
  {
    id: 'REP003',
    type: 'Overcrowded',
    location: 'T. Nagar Bus Terminus',
    time: '5m ago',
    description: '[Bus Code: MTC-21G-02] High standing passenger rush during peak hour.',
    upvotes: 18,
    downvotes: 2,
    reporterId: 'user789',
    reporterName: 'Karthik V',
    reporterReputation: 'Regular',
    vehicle_id: 'TN 01 N 3456',
    verified: false,
    isSynced: true,
    status: 'active'
  },
  {
    id: 'REP004',
    type: 'Traffic',
    location: 'Velachery Bypass Signal',
    time: '2m ago',
    description: '[Bus Code: MTC-570-01] Signal delay near Taramani TIDEL park junction.',
    upvotes: 6,
    downvotes: 0,
    reporterId: 'user101',
    reporterName: 'Yuvaraj M. (You)',
    reporterReputation: 'Trusted',
    vehicle_id: 'TN 01 N 5701',
    verified: true,
    isSynced: true,
    status: 'active'
  }
];