import type { Message } from "@/i18n/message";
import {
  toastsSlice,
  ToastLevel,
  ToastType,
} from "@/store/slices/toasts-slice";

describe("toastsSlice", () => {
  const makeMessage = (defaultMessage: string): Message => ({
    defaultMessage,
    id: "test.id",
  });

  it("should add an info toast", () => {
    const initialState: ToastType[] = [];
    const message = makeMessage("Info message");
    const state = toastsSlice.reducer(
      initialState,
      toastsSlice.actions.info(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(ToastLevel.INFO);
    expect(state[0].text).toEqual(message);
    expect(typeof state[0].id).toBe("string");
    expect(state[0].ttl).toBe(2000 + message.defaultMessage.length * 50);
  });

  it("should add a success toast", () => {
    const initialState: ToastType[] = [];
    const message = makeMessage("Success!");
    const state = toastsSlice.reducer(
      initialState,
      toastsSlice.actions.success(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(ToastLevel.SUCCESS);
    expect(state[0].text).toEqual(message);
  });

  it("should add a warning toast", () => {
    const initialState: ToastType[] = [];
    const message = makeMessage("Warning!");
    const state = toastsSlice.reducer(
      initialState,
      toastsSlice.actions.warning(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(ToastLevel.WARNING);
    expect(state[0].text).toEqual(message);
  });

  it("should add an error toast", () => {
    const initialState: ToastType[] = [];
    const message = makeMessage("Error!");
    const state = toastsSlice.reducer(
      initialState,
      toastsSlice.actions.error(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(ToastLevel.ERROR);
    expect(state[0].text).toEqual(message);
  });

  it("should remove a toast by id", () => {
    const message = makeMessage("To be removed");
    const stateWithToast = toastsSlice.reducer(
      [],
      toastsSlice.actions.info(message),
    );
    const toastId = stateWithToast[0].id;
    const stateAfterClose = toastsSlice.reducer(
      stateWithToast,
      toastsSlice.actions.close(toastId),
    );
    expect(stateAfterClose).toHaveLength(0);
  });

  it("should not remove any toast if id does not match", () => {
    const message = makeMessage("Stay!");
    const stateWithToast = toastsSlice.reducer(
      [],
      toastsSlice.actions.info(message),
    );
    const stateAfterClose = toastsSlice.reducer(
      stateWithToast,
      toastsSlice.actions.close("non-existent-id"),
    );
    expect(stateAfterClose).toHaveLength(1);
    expect(stateAfterClose[0].text).toEqual(message);
  });
});
