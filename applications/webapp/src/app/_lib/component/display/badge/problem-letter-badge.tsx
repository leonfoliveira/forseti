import { Badge } from "@/app/_lib/component/shadcn/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_lib/component/shadcn/tooltip";
import { ColorUtil } from "@/app/_lib/util/color-util";

type Props = React.ComponentProps<typeof Badge> & {
  problem: {
    color: string;
    letter: string;
    title: string;
  };
};

export function ProblemLetterBadge({ problem, ...props }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          {...props}
          style={{ backgroundColor: problem.color }}
          data-testid="problem-letter-badge"
        >
          <span
            style={{
              color: ColorUtil.getForegroundColor(problem.color),
            }}
          >
            {problem.letter}
          </span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{problem.title}</TooltipContent>
    </Tooltip>
  );
}
