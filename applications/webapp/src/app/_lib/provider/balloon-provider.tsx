import { Balloon } from "@/app/_lib/component/display/balloon";
import { balloonSlice } from "@/app/_store/slices/balloon-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";

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
            dispatch(balloonSlice.actions.removeBallon({ id: balloon.id }))
          }
        />
      ))}
    </div>
  );
}
