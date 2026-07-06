export const getDepartmentBadgeColor = (deptName: string): string => {
  const name = (deptName || '').toUpperCase().trim();
  switch (name) {
    case 'IIC':
      return 'badge-iic';
    case 'STARTUP':
      return 'badge-startup';
    case 'EVENTS':
      return 'badge-events';
    case 'OPERATION':
      return 'badge-operation';
    case 'CREATIVE':
      return 'badge-creative';
    case 'MEDIA':
      return 'badge-media';
    case 'SPONSORSHIP':
      return 'badge-sponsorship';
    case 'PR':
      return 'badge-pr';
    case 'MARKETING':
      return 'badge-marketing';
    case 'TECHNICAL':
      return 'badge-technical';
    case 'DOCUMENTATION':
      return 'badge-documentation';
    default:
      return 'bg-bg-elevated/70 border border-border-subtle text-text-secondary';
  }
};

export const getDepartmentColorClass = (deptName: string): string => {
  const name = (deptName || '').toUpperCase().trim();
  switch (name) {
    case 'IIC':
      return 'bg-violet-500';
    case 'STARTUP':
      return 'bg-emerald-500';
    case 'EVENTS':
      return 'bg-amber-500';
    case 'OPERATION':
      return 'bg-rose-500';
    case 'CREATIVE':
      return 'bg-pink-500';
    case 'MEDIA':
      return 'bg-sky-500';
    case 'SPONSORSHIP':
      return 'bg-teal-500';
    case 'PR':
      return 'bg-indigo-500';
    case 'MARKETING':
      return 'bg-fuchsia-500';
    case 'TECHNICAL':
      return 'bg-cyan-500';
    case 'DOCUMENTATION':
      return 'bg-orange-500';
    default:
      return 'bg-primary';
  }
};
