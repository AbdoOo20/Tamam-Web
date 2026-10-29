/** Icon for a notification type; unknown types get a bell. */
export function notificationIcon(type: string): string {
  const key = type.toLowerCase();

  if (key.includes('trial')) {
    return 'bi-hourglass-split';
  }

  if (key.includes('confirm')) {
    return 'bi-check2-circle';
  }

  if (key.includes('cancel') || key.includes('reject') || key.includes('refus')) {
    return 'bi-x-octagon';
  }

  if (key.includes('risk')) {
    return 'bi-shield-exclamation';
  }

  if (key.includes('order')) {
    return 'bi-bag';
  }

  return 'bi-bell';
}
