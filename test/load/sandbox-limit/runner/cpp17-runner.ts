import { Actor } from "../../util/actor";
import { Runner } from "../runner";

export class Cpp17Runner extends Runner {
  constructor(actor: Actor, problemId: string) {
    super("CPP_17", actor, problemId);
  }

  buildTimeLimitCode(multiplier: number) {
    return `
#include <iostream>
#include <thread>
#include <chrono>

using namespace std;

int main() {
    this_thread::sleep_for(chrono::milliseconds(100 * ${multiplier}));

    int x;
    cin >> x;
    cout << x * 2 << endl;
    return 0;
}
`;
  }

  buildMemoryLimitCode(multiplier: number) {
    return `
#include <iostream>
#include <vector>
#include <cmath>
#include <vector>

using namespace std;

int main() {
    int size = static_cast<int>(pow(10, ${multiplier}));
    vector<int> a(size);

    int x;
    cin >> x;
    cout << x * 2 << endl;
    return 0;
}
`;
  }

  buildFile(code: string) {
    const blob = new Blob([code], { type: "text/x-c++src" });
    const file = new File([blob], "code.cpp", { type: "text/x-c++src" });
    return file;
  }
}
