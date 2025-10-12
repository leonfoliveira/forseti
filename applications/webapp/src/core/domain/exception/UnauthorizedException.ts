import { BusinessException } from "@/core/domain/exception/BusinessException";

export class UnauthorizedException extends BusinessException {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedException";
  }
}
