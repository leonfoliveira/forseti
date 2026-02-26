export abstract class BroadcastRoom<
  TCallbacks extends { [event: string]: (payload: any) => void },
> {
  constructor(
    public name: string,
    public callbacks: TCallbacks,
  ) {}
}
