import { BusinessException } from "@/domain/exception/BusinessException";

export class ForbiddenException extends BusinessException {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenException";
  }
}
