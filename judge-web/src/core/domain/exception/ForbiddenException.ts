import { BusinessException } from "@/core/domain/exception/BusinessException";

export class ForbiddenException extends BusinessException {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenException";
  }
}
