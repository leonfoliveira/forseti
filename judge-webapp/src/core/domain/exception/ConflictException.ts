import { BusinessException } from "@/core/domain/exception/BusinessException";

export class ConflictException extends BusinessException {
  constructor(message: string) {
    super(message);
    this.name = "ConflictException";
  }
}
