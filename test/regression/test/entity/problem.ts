export class Problem {
  constructor(
    public readonly letter: string,
    public readonly title: string,
    public readonly descriptionFile: string,
    public readonly testCasesFile: string,
    public readonly timeLimit: number,
    public readonly memoryLimit: number,
  ) {}

  toOption() {
    return `${this.letter}. ${this.title}`;
  }
}
