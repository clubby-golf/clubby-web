const navbarLinks = [
  {
    key: 'clubs',
    label: 'Clubs',
    href: '/s?pub_categoryLevel1=clubs',
    children: [
      {
        key: 'drivers',
        label: 'Drivers',
        href: '/s?pub_categoryLevel2=clubs&pub_categoryLevel3=drivers',
      },
      {
        key: 'irons',
        label: 'Irons',
        href: '/s?pub_categoryLevel2=clubs&pub_categoryLevel3=irons',
      },
      {
        key: 'putters',
        label: 'Putters',
        href: '/s?pub_categoryLevel2=clubs&pub_categoryLevel3=putters',
      },
    ],
  },
  {
    key: 'balls',
    label: 'Balls',
    href: '/s?pub_categoryLevel1=balls',
    children: [
      {
        key: 'tour',
        label: 'Tour Balls',
        href: '/s?pub_categoryLevel2=balls&pub_categoryLevel3=tour',
      },
      {
        key: 'practice',
        label: 'Practice Balls',
        href: '/s?pub_categoryLevel2=balls&pub_categoryLevel3=practice',
      },
      {
        key: 'distance',
        label: 'Distance Balls',
        href: '/s?pub_categoryLevel2=balls&pub_categoryLevel3=distance',
      },
    ],
  },
  {
    key: 'gear',
    label: 'Gear',
    href: '/s?pub_categoryLevel1=gear',
    children: [
      {
        key: 'bags',
        label: 'Golf Bags',
        href: '/s?pub_categoryLevel2=gear&pub_categoryLevel3=bags',
      },
      {
        key: 'gloves',
        label: 'Gloves',
        href: '/s?pub_categoryLevel2=gear&pub_categoryLevel3=gloves',
      },
      { key: 'shoes', label: 'Shoes', href: '/s?pub_categoryLevel2=gear&pub_categoryLevel3=shoes' },
    ],
  },
  {
    key: 'womens',
    label: 'Women’s',
    href: '/s?pub_categoryLevel1=womens',
    children: [
      {
        key: 'apparel',
        label: 'Apparel',
        href: '/s?pub_categoryLevel2=womens&pub_categoryLevel3=apparel',
      },
      {
        key: 'shoes-w',
        label: 'Shoes',
        href: '/s?pub_categoryLevel2=womens&pub_categoryLevel3=shoes',
      },
      {
        key: 'clubs-w',
        label: 'Clubs',
        href: '/s?pub_categoryLevel2=womens&pub_categoryLevel3=clubs',
      },
    ],
  },
  {
    key: 'customs',
    label: 'Customs',
    href: '/s?pub_categoryLevel1=customs',
    children: [
      {
        key: 'club-building',
        label: 'Club Building',
        href: '/s?pub_categoryLevel2=customs&pub_categoryLevel3=building',
      },
      {
        key: 'shafts',
        label: 'Shafts',
        href: '/s?pub_categoryLevel2=customs&pub_categoryLevel3=shafts',
      },
      {
        key: 'grips',
        label: 'Grips',
        href: '/s?pub_categoryLevel2=customs&pub_categoryLevel3=grips',
      },
    ],
  },
  {
    key: 'fitting',
    label: 'Fitting',
    href: '/s?pub_categoryLevel1=fitting',
    children: [
      { key: 'book-appointment', label: 'Book Appointment', href: '/fitting/appointment' },
      { key: 'fitting-guides', label: 'Fitting Guides', href: '/fitting/guides' },
      { key: 'virtual-fit', label: 'Virtual Fitting', href: '/fitting/virtual' },
    ],
  },
  {
    key: 'media',
    label: 'Media',
    href: '/s?pub_categoryLevel1=media',
    children: [
      { key: 'videos', label: 'Videos', href: '/media/videos' },
      { key: 'articles', label: 'Articles', href: '/media/articles' },
      { key: 'podcasts', label: 'Podcasts', href: '/media/podcasts' },
    ],
  },
  {
    key: 'team',
    label: 'Team',
    href: '/s?pub_categoryLevel1=team',
    children: [
      { key: 'pros', label: 'Our Pros', href: '/team/pros' },
      { key: 'ambassadors', label: 'Ambassadors', href: '/team/ambassadors' },
      { key: 'staff', label: 'Staff', href: '/team/staff' },
    ],
  },
];

export { navbarLinks };
