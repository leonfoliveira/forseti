import { LocalStorageService } from "@/service/LocalStorageService";

describe("LocalStorageService", () => {
  it("delegates get, set, and delete operations to its repository", () => {
    const value = { enabled: true };
    const repository = {
      setKey: jest.fn(),
      getKey: jest.fn().mockReturnValue(value),
      deleteKey: jest.fn(),
    };
    const service = new LocalStorageService(repository);

    service.setKey("settings", value);
    expect(service.getKey<typeof value>("settings")).toBe(value);
    service.deleteKey("settings");

    expect(repository.setKey).toHaveBeenCalledWith("settings", value);
    expect(repository.getKey).toHaveBeenCalledWith("settings");
    expect(repository.deleteKey).toHaveBeenCalledWith("settings");
  });
});
