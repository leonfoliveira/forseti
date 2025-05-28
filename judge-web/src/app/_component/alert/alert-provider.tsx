import { useAtom } from "jotai";
import { alertAtom } from "@/app/_atom/alert-atom";
import { Alert } from "@/app/_component/alert/alert";

export function AlertProvider() {
  const [alerts, setAlerts] = useAtom(alertAtom);

  return (
    <div className="fixed top-0 w-full p-2 z-50">
      <div className="max-w-xl m-auto flex flex-col gap-1">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            alert={alert}
            onClose={() =>
              setAlerts((alerts) => alerts.filter((it) => it.id !== alert.id))
            }
          />
        ))}
      </div>
    </div>
  );
}
