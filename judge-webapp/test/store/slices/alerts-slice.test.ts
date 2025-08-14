import { renderHook } from "@testing-library/react";

import type { Message } from "@/i18n/message";
import {
  alertsSlice,
  AlertLevel,
  AlertType,
  useAlert,
} from "@/store/slices/alerts-slice";
import { mockAppDispatch } from "@/test/jest.setup";

jest.unmock("@/store/slices/alerts-slice");

describe("alertsSlice", () => {
  const makeMessage = (defaultMessage: string): Message => ({
    defaultMessage,
    id: "test.id",
  });

  it("should add an info alert", () => {
    const initialState: AlertType[] = [];
    const message = makeMessage("Info message");
    const state = alertsSlice.reducer(
      initialState,
      alertsSlice.actions.info(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(AlertLevel.INFO);
    expect(state[0].text).toEqual(message);
    expect(typeof state[0].id).toBe("string");
    expect(state[0].ttl).toBe(2000 + message.defaultMessage.length * 50);
  });

  it("should add a success alert", () => {
    const initialState: AlertType[] = [];
    const message = makeMessage("Success!");
    const state = alertsSlice.reducer(
      initialState,
      alertsSlice.actions.success(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(AlertLevel.SUCCESS);
    expect(state[0].text).toEqual(message);
  });

  it("should add a warning alert", () => {
    const initialState: AlertType[] = [];
    const message = makeMessage("Warning!");
    const state = alertsSlice.reducer(
      initialState,
      alertsSlice.actions.warning(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(AlertLevel.WARNING);
    expect(state[0].text).toEqual(message);
  });

  it("should add an error alert", () => {
    const initialState: AlertType[] = [];
    const message = makeMessage("Error!");
    const state = alertsSlice.reducer(
      initialState,
      alertsSlice.actions.error(message),
    );
    expect(state).toHaveLength(1);
    expect(state[0].level).toBe(AlertLevel.ERROR);
    expect(state[0].text).toEqual(message);
  });

  it("should remove an alert by id", () => {
    const message = makeMessage("To be removed");
    const stateWithAlert = alertsSlice.reducer(
      [],
      alertsSlice.actions.info(message),
    );
    const alertId = stateWithAlert[0].id;
    const stateAfterClose = alertsSlice.reducer(
      stateWithAlert,
      alertsSlice.actions.close(alertId),
    );
    expect(stateAfterClose).toHaveLength(0);
  });

  it("should not remove any alert if id does not match", () => {
    const message = makeMessage("Stay!");
    const stateWithAlert = alertsSlice.reducer(
      [],
      alertsSlice.actions.info(message),
    );
    const stateAfterClose = alertsSlice.reducer(
      stateWithAlert,
      alertsSlice.actions.close("non-existent-id"),
    );
    expect(stateAfterClose).toHaveLength(1);
    expect(stateAfterClose[0].text).toEqual(message);
  });
});

describe("useAlert", () => {
  const message = {
    id: "message",
    defaultMessage: "Message",
  };

  it("should call dispatch with correct action", () => {
    const { result } = renderHook(() => useAlert());

    result.current.info(message);
    result.current.success(message);
    result.current.warning(message);
    result.current.error(message);

    expect(mockAppDispatch).toHaveBeenCalledWith(
      alertsSlice.actions.info(message),
    );
    expect(mockAppDispatch).toHaveBeenCalledWith(
      alertsSlice.actions.success(message),
    );
    expect(mockAppDispatch).toHaveBeenCalledWith(
      alertsSlice.actions.warning(message),
    );
    expect(mockAppDispatch).toHaveBeenCalledWith(
      alertsSlice.actions.error(message),
    );
  });
});
