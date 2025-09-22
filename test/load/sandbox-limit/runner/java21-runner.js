import { Runner } from "../runner.js";

class Java21Runner extends Runner {
  constructor(actor, problemId) {
    super("JAVA_21", actor, problemId);
  }

  buildTimeLimitCode(multiplier) {
    return `
import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) {
        try {
            TimeUnit.MILLISECONDS.sleep((long) (100 * ${multiplier}));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        Scanner scanner = new Scanner(System.in);
        int input = scanner.nextInt();
        System.out.println(2 * input);
        scanner.close();
    }
}
`;
  }

  buildMemoryLimitCode(multiplier) {
    return `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int size = (int) Math.pow(10, ${multiplier});
        int[] a = new int[size];

        Scanner scanner = new Scanner(System.in);
        int input = scanner.nextInt();
        System.out.println(2 * input);
        scanner.close();
    }
} 
`;
  }

  buildFile(code) {
    const blob = new Blob([code], { type: "text/x-java" });
    const file = new File([blob], "Main.java", { type: "text/x-java" });
    return file;
  }
}

export { Java21Runner };
