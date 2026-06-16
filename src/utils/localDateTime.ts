/** Datetime local `YYYY-MM-DDTHH:mm:ss` — không chuyển sang UTC. */
export function getLocalDateTimeNow(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-').concat(
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  );
}
