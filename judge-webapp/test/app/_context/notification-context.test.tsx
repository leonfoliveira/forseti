import { renderHook, act, screen } from "@testing-library/react";
import {
  NotificationProvider,
  useAlert,
  useToast,
  NotificationLevel,
  NotificationType,
} from "@/app/_context/notification-context";
import React from "react";

jest.mock("@/app/_context/notification-context", () =>
  jest.requireActual("@/app/_context/notification-context")
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

    const message = { id: "text", defaultMessage: "Info message" };
    act(() => {
      result.current.info(message);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe(message);
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

    const message = { id: "text", defaultMessage: "Success message" };
    act(() => {
      result.current.success(message);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe(message);
    expect(result.current.items[0].level).toBe(NotificationLevel.SUCCESS);
    expect(result.current.items[0].type).toBe(NotificationType.TOAST);
  });

  it("removes a notification by id", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    const { result } = renderHook(() => useAlert(), { wrapper });

    act(() => {
      result.current.warning({ id: "text", defaultMessage: "Warning message" });
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

    const alertMessage = { id: "text", defaultMessage: "Error message" };
    const toastMessage = { id: "text", defaultMessage: "Toast info message" };
    act(() => {
      alertHook.result.current.error(alertMessage);
      toastHook.result.current.info(toastMessage);
    });

    expect(alertHook.result.current.items).toHaveLength(1);
    expect(alertHook.result.current.items[0].text).toBe(alertMessage);
    expect(alertHook.result.current.items[0].level).toBe(
      NotificationLevel.ERROR
    );

    expect(toastHook.result.current.items).toHaveLength(1);
    expect(toastHook.result.current.items[0].text).toBe(toastMessage);
    expect(toastHook.result.current.items[0].level).toBe(
      NotificationLevel.INFO
    );
  });

  it("assigns a default ttl based on text length", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success({ id: "text", defaultMessage: "Short message" });
    });

    expect(result.current.items[0].ttl).toBe(
      2000 + "Short message".length * 50
    );
  });
});
