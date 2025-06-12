export enum ToastLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type ToastType = {
  id: string;
  level: ToastLevel;
  text: string;
  ttl: number;
};
