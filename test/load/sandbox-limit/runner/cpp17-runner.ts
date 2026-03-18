import { SubmissionLanguage } from "../../util/types";
import { Runner } from "./runner";

export class Cpp17Runner extends Runner {
  constructor() {
    super(SubmissionLanguage.CPP_17);
  }

  protected buildTimeLimitCode(power: number): string {
    return `
#include <iostream>
#include <thread>
#include <chrono>

using namespace std;

int main() {
    for (volatile long i = 0; i < ${10 ** power}l; i++) {}
    int x;
    cin >> x;
    cout << x * 2 << endl;
    return 0;
}
`;
  }

  protected buildMemoryLimitCode(power: number): string {
    return `
#include <iostream>
#include <vector>
#include <cmath>
#include <vector>

using namespace std;

int main() {
    vector<int> a(${10 ** power});
    int x;
    cin >> x;
    cout << x * 2 << endl;
    return 0;
}
`;
  }

  protected buildCodeFile(code: string): File {
    const blob = new Blob([code], { type: "text/x-c++src" });
    const file = new File([blob], "code.cpp", { type: "text/x-c++src" });
    return file;
  }
}
