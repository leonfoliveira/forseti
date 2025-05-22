export function formatDateTime(date: string): string {
  const parsedDate = new Date(date);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = parsedDate.getFullYear();
  const month = pad(parsedDate.getMonth() + 1);
  const day = pad(parsedDate.getDate());
  const hours = pad(parsedDate.getHours());
  const minutes = pad(parsedDate.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function toLocaleString(date: string): string {
  const parsedDate = new Date(date);
  return parsedDate.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
