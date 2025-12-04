import { ServerException } from "@/core/domain/exception/ServerException";

export class ServiceUnavailableException extends ServerException {
  constructor(message: string) {
    super(message);
    this.name = "ServiceUnavailableException";
  }
}
