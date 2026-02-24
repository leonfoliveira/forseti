import * as clientSideComposition from "@/config/composition/client-side-composition";
import * as serverSideComposition from "@/config/composition/server-side-composition";
import { isClientSide } from "@/config/config";

export const Composition = isClientSide()
  ? clientSideComposition.build()
  : serverSideComposition.build();
