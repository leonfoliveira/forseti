import { BusinessException } from "@/core/domain/exception/BusinessException";

export class NotFoundException extends BusinessException {
  constructor(message: string) {
    super(message);
  }
}
