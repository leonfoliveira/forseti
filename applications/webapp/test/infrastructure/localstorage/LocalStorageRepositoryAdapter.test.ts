import { LocalStorageRepositoryAdapter } from "@/infrastructure/localstorage/LocalStorageRepositoryAdapter";

describe("LocalStorageRepositoryAdapter", () => {
  const repository = new LocalStorageRepositoryAdapter();

  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves JSON values", () => {
    const value = { key: "value", count: 3 };

    repository.setKey("settings", value);

    expect(localStorage.getItem("settings")).toBe(JSON.stringify(value));
    expect(repository.getKey<typeof value>("settings")).toEqual(value);
  });

  it("returns undefined for a missing key", () => {
    expect(repository.getKey("missing")).toBeUndefined();
  });

  it("removes a stored key", () => {
    repository.setKey("settings", { enabled: true });

    repository.deleteKey("settings");

    expect(localStorage.getItem("settings")).toBeNull();
  });
});
