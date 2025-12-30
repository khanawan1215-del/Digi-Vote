import { format, formatDistance, formatRelative } from 'date-fns';

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'PPP p');
}

export function formatTimeRemaining(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getTimeAgo(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function getRelativeTime(date: string | Date): string {
  return formatRelative(new Date(date), new Date());
}