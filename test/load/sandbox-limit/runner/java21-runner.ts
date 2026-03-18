import { SubmissionLanguage } from "../../util/types";
import { Runner } from "./runner";

export class Java21Runner extends Runner {
  constructor() {
    super(SubmissionLanguage.JAVA_21);
  }

  protected buildTimeLimitCode(power: number): string {
    return `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        for (long i = 0; i < ${10 ** power}l; i++) {}
        Scanner scanner = new Scanner(System.in);
        int input = scanner.nextInt();
        System.out.println(2 * input);
        scanner.close();
    }
}
`;
  }

  protected buildMemoryLimitCode(power: number): string {
    return `
import java.util.ArrayList;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        var list = new ArrayList<Integer>();
        for (int i = 0; i < ${10 ** power}; i++) {
            list.add(0);
        }
        Scanner scanner = new Scanner(System.in);
        int input = scanner.nextInt();
        System.out.println(2 * input);
        scanner.close();
    }
}
`;
  }

  protected buildCodeFile(code: string): File {
    const blob = new Blob([code], { type: "text/x-java" });
    const file = new File([blob], "Main.java", { type: "text/x-java-source" });
    return file;
  }
}
