import { FaBoxesStacked, FaGaugeHigh, FaRightLeft, FaUserShield } from 'react-icons/fa6';

export const getNavigationItems = (role) => {
  const allItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: FaGaugeHigh,
      roles: ['admin', 'base_commander', 'logistics_officer']
    },
    {
      label: 'Purchases',
      path: '/purchases',
      icon: FaBoxesStacked,
      roles: ['admin', 'base_commander', 'logistics_officer']
    },
    {
      label: 'Transfers',
      path: '/transfers',
      icon: FaRightLeft,
      roles: ['admin', 'base_commander', 'logistics_officer']
    },
    {
      label: 'Assignments',
      path: '/assignments',
      icon: FaUserShield,
      roles: ['admin', 'base_commander']
    }
  ];

  return allItems.filter((item) => item.roles.includes(role));
};
