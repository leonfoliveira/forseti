export enum AlertLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export type AlertType = {
  id: string;
  level: AlertLevel;
  text: string;
  ttl: number;
};
