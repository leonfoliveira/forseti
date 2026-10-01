import { LocalStorageRepository } from "@/port/output/repository/LocalStorageRepository";
import { LocalStorageReader } from "@/port/input/usecase/localstorage/LocalStorageReader";
import { LocalStorageWritter } from "@/port/input/usecase/localstorage/LocalStorageWritter";

export class LocalStorageService
  implements LocalStorageReader, LocalStorageWritter
{
  constructor(private readonly storageRepository: LocalStorageRepository) {}

  setKey<TValue>(key: string, value: TValue): void {
    this.storageRepository.setKey(key, value);
  }

  getKey<TValue>(key: string): TValue | undefined {
    return this.storageRepository.getKey<TValue>(key);
  }

  deleteKey(key: string): void {
    this.storageRepository.deleteKey(key);
  }
}
