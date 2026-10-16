export interface WorkerProfile {
  id: string;
  name: string;
  role: 'Plumber' | 'Electrician' | 'Carpenter' | 'Painter' | 'Mason' | 'Welder' | 'Cleaner' | 'Supervisor';
  tag: string;
  rate: number;
  rateUnit: string; // e.g. '/day', '/visit', '/hr'
  rating: number;
  reviewsCount: number;
  location: string;
  experienceYears: number;
  aboutMe: string;
  isVerified: boolean;
  avatarUrl: string;
  heroPhotoUrl: string;
  phone: string;
  skills: string[];
  gallery: {
    id: string;
    title: string;
    imageUrl: string;
  }[];
}

export const WORKER_DIRECTORY: WorkerProfile[] = [
  {
    id: 'worker-1',
    name: 'Daniel Walker',
    role: 'Plumber',
    tag: 'Plumber',
    rate: 45,
    rateUnit: '(per visit)',
    rating: 4.9,
    reviewsCount: 130,
    location: 'Sector 14, Mansarovar, Jaipur',
    experienceYears: 8,
    aboutMe:
      "Hi! I'm a certified plumbing technician. I focus on delivering fast, clean, and dependable solutions for all types of plumbing issues, pipeline fitting, and sanitary overhauls. Your comfort and satisfaction come first.",
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 98765 43210',
    skills: ['Copper & CPVC Piping', 'Leak Detection', 'Sanitary Fitting', 'Water Heater Repair', 'Drain Cleaning'],
    gallery: [
      { id: 'g1', title: 'Copper Sink Plumbing', imageUrl: '/images/gallery_plumbing.jpg' },
      { id: 'g2', title: 'Pipeline Assembly', imageUrl: '/images/gallery_plumbing.jpg' },
      { id: 'g3', title: 'Bathroom Sanitary Fitting', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
  {
    id: 'worker-2',
    name: 'Subhash Mistry',
    role: 'Mason',
    tag: 'Mason',
    rate: 950,
    rateUnit: '/day',
    rating: 4.8,
    reviewsCount: 142,
    location: 'Civil Lines, Ring Road, Jaipur',
    experienceYears: 12,
    aboutMe:
      'Master mason with 12+ years of field experience in RCC column casting, red brick masonry, plastering, and stone cladding. Reliable site team leader with meticulous attention to structural leveling.',
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 98290 11223',
    skills: ['Brick Laying', 'RCC Casting', 'Plastering', 'Stone Cladding', 'Scaffolding'],
    gallery: [
      { id: 'g4', title: 'Ground Floor Column Casting', imageUrl: '/images/gallery_plumbing.jpg' },
      { id: 'g5', title: 'Boundary Wall Brickwork', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
  {
    id: 'worker-3',
    name: 'Rajesh Sharma',
    role: 'Electrician',
    tag: 'Electrician',
    rate: 40,
    rateUnit: '/day',
    rating: 4.9,
    reviewsCount: 210,
    location: 'Malviya Nagar, Jaipur',
    experienceYears: 7,
    aboutMe:
      'Licensed residential and industrial electrician. Expert in conduit wiring, MCB distribution boards, load balancing, inverter setups, and smart architectural LED lighting.',
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 94140 55667',
    skills: ['Conduit Wiring', 'Distribution Panel', 'Smart Switchboards', 'Fault Diagnosis', 'Earthing Pit'],
    gallery: [
      { id: 'g6', title: 'Main MCB Box Wiring', imageUrl: '/images/gallery_plumbing.jpg' },
      { id: 'g7', title: 'Ceiling Concealed Lights', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
  {
    id: 'worker-4',
    name: 'Mohan Suthar',
    role: 'Carpenter',
    tag: 'Carpenter',
    rate: 1000,
    rateUnit: '/day',
    rating: 4.8,
    reviewsCount: 88,
    location: 'Durgapura, Jaipur',
    experienceYears: 10,
    aboutMe:
      'Skilled carpenter specializing in plywood shuttering framework, teakwood door frame fixing, modular kitchen fabrication, and veneer finishes.',
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 98877 33445',
    skills: ['Formwork & Shuttering', 'Door Frames', 'Modular Kitchens', 'Wood Polishing', 'Hardware Fitting'],
    gallery: [
      { id: 'g8', title: 'Slab Shuttering Plates', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
  {
    id: 'worker-5',
    name: 'Amit Verma',
    role: 'Painter',
    tag: 'Painter',
    rate: 35,
    rateUnit: '/day',
    rating: 4.7,
    reviewsCount: 165,
    location: 'Vaishali Nagar, Jaipur',
    experienceYears: 6,
    aboutMe:
      'Professional wall finishing contractor. Expertise in exterior weather-coat painting, interior wall putty smoothing, texture spray, and waterproofing damp protection coats.',
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 97722 88990',
    skills: ['Wall Putty Smoothing', 'Interior Emulsion', 'Apex Weathercoat', 'Texture Painting', 'Damp Treatment'],
    gallery: [
      { id: 'g9', title: 'Living Room Texture Finish', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
  {
    id: 'worker-6',
    name: 'Suresh Kumar',
    role: 'Welder',
    tag: 'Welder',
    rate: 850,
    rateUnit: '/day',
    rating: 4.6,
    reviewsCount: 74,
    location: 'Sitapura Industrial Area, Jaipur',
    experienceYears: 9,
    aboutMe:
      'Arc and MIG welding specialist. Experienced in MS heavy gate fabrication, terrace shed trusses, safety grills, and staircase railing installations.',
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 96020 44556',
    skills: ['Arc Welding', 'Truss Fabrication', 'MS Grill & Railing', 'Structural Fabrication', 'Plasma Cutting'],
    gallery: [
      { id: 'g10', title: 'Industrial Truss Welding', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
  {
    id: 'worker-7',
    name: 'Pooja Cleaning Crew',
    role: 'Cleaner',
    tag: 'Cleaner',
    rate: 55,
    rateUnit: '/session',
    rating: 4.5,
    reviewsCount: 120,
    location: 'Mansarovar, Jaipur',
    experienceYears: 5,
    aboutMe:
      'Post-construction deep site cleaning service. Complete debris removal, tile scrubbing, acid wash for grout haze, glass facade cleaning, and handover-ready sanitation.',
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 93510 66778',
    skills: ['Post-Construction Scrubbing', 'Tile Acid Wash', 'Window Glass Detailing', 'Debris Clearing', 'Disinfection'],
    gallery: [
      { id: 'g11', title: 'Post-Construction Floor Scrubbing', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
  {
    id: 'worker-8',
    name: 'Vikram Choudhary',
    role: 'Supervisor',
    tag: 'Supervisor',
    rate: 1200,
    rateUnit: '/day',
    rating: 4.9,
    reviewsCount: 195,
    location: 'Jhotwara, Jaipur',
    experienceYears: 14,
    aboutMe:
      'Site supervisor managing day-to-day material dispatch, labour roll-call, drawing measurements, and safety compliances across multi-storey residential projects.',
    isVerified: true,
    avatarUrl: '/images/technician_portrait.jpg',
    heroPhotoUrl: '/images/technician_portrait.jpg',
    phone: '+91 98288 77665',
    skills: ['Site Measurements', 'Material Audits', 'Daily Log Registers', 'Quality Inspection', 'Labour Coordination'],
    gallery: [
      { id: 'g12', title: 'Residential Slab Supervision', imageUrl: '/images/gallery_plumbing.jpg' },
    ],
  },
];
