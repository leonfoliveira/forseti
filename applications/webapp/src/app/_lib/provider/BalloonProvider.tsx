import { Balloon } from "@/app/_lib/component/display/Balloon";
import { BalloonSlice } from "@/app/_store/slice/BalloonSlice";
import { useAppDispatch, useAppSelector } from "@/app/_store/Store";

export function BalloonProvider() {
  const balloons = useAppSelector((state) => state.balloon);
  const dispatch = useAppDispatch();

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-50 h-dvh w-dvw">
      {balloons.map((balloon) => (
        <Balloon
          key={balloon.id}
          color={balloon.color}
          onTopReached={() =>
            dispatch(BalloonSlice.actions.removeBalloon({ id: balloon.id }))
          }
        />
      ))}
    </div>
  );
}
