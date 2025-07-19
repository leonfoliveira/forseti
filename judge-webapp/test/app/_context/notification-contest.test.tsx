import { renderHook, act, screen } from "@testing-library/react";
import {
  NotificationProvider,
  useAlert,
  useToast,
  NotificationLevel,
  NotificationType,
} from "@/app/_component/context/notification-context";
import React from "react";

jest.mock("@/app/_component/context/notification-context", () =>
  jest.requireActual("@/app/_component/context/notification-context"),
);

jest.mock("@/app/_component/notification/alert-box", () => ({
  AlertBox: () => <div data-testid="alert-box">Alert Box</div>,
}));
jest.mock("@/app/_component/notification/toast-box", () => ({
  ToastBox: () => <div data-testid="toast-box">Toast Box</div>,
}));

describe("NotificationProvider", () => {
  it("adds a new alert notification and retrieves it", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    const { result } = renderHook(() => useAlert(), { wrapper });

    act(() => {
      result.current.info("Info message");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe("Info message");
    expect(result.current.items[0].level).toBe(NotificationLevel.INFO);
    expect(result.current.items[0].type).toBe(NotificationType.ALERT);
    expect(screen.getByTestId("alert-box")).toBeInTheDocument();
    expect(screen.getByTestId("alert-box")).toBeInTheDocument();
  });

  it("adds a new toast notification and retrieves it", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success("Success message");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe("Success message");
    expect(result.current.items[0].level).toBe(NotificationLevel.SUCCESS);
    expect(result.current.items[0].type).toBe(NotificationType.TOAST);
  });

  it("removes a notification by id", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    const { result } = renderHook(() => useAlert(), { wrapper });

    act(() => {
      result.current.warning("Warning message");
    });

    const notificationId = result.current.items[0].id;

    act(() => {
      result.current.close(notificationId);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("handles multiple notifications of different types", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    const alertHook = renderHook(() => useAlert(), { wrapper });
    const toastHook = renderHook(() => useToast(), { wrapper });

    act(() => {
      alertHook.result.current.error("Error message");
      toastHook.result.current.info("Toast info message");
    });

    expect(alertHook.result.current.items).toHaveLength(1);
    expect(alertHook.result.current.items[0].text).toBe("Error message");
    expect(alertHook.result.current.items[0].level).toBe(
      NotificationLevel.ERROR,
    );

    expect(toastHook.result.current.items).toHaveLength(1);
    expect(toastHook.result.current.items[0].text).toBe("Toast info message");
    expect(toastHook.result.current.items[0].level).toBe(
      NotificationLevel.INFO,
    );
  });

  it("assigns a default ttl based on text length", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success("Short message");
    });

    expect(result.current.items[0].ttl).toBe(
      2000 + "Short message".length * 50,
    );
  });
});
