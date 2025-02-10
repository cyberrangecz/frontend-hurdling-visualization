export function getTimeString(seconds: number): string {
  const days: number = Math.floor(seconds / 86400);
  const hours: number = Math.floor((seconds - days * 86400) / 3600);
  const minutes: number = Math.floor((seconds - days * 86400 - hours * 3600) / 60);
  const daysStr = days > 0 ? days.toString() + (days > 1 ? ' days, ' : ' day, ') : '';

  seconds = Math.floor(seconds - days * 86400 - hours * 3600 - minutes * 60);

  return (
    daysStr + hours.toString() + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
  );
}
