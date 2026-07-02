export const getDepartmentBadgeColor = (deptName: string): string => {
  const name = (deptName || '').toUpperCase().trim();
  switch (name) {
    case 'IIC':
      return 'bg-violet-500/10 border-violet-500/30 text-violet-300';
    case 'STARTUP':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    case 'EVENTS':
      return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
    case 'OPERATION':
      return 'bg-rose-500/10 border-rose-500/30 text-rose-300';
    case 'CREATIVE':
      return 'bg-pink-500/10 border-pink-500/30 text-pink-300';
    case 'MEDIA':
      return 'bg-sky-500/10 border-sky-500/30 text-sky-300';
    case 'SPONSORSHIP':
      return 'bg-teal-500/10 border-teal-500/30 text-teal-300';
    case 'PR':
      return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300';
    case 'MARKETING':
      return 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300';
    case 'TECHNICAL':
      return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    default:
      return 'bg-bg-elevated/70 border-border-subtle text-text-secondary';
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
    default:
      return 'bg-primary';
  }
};
