#include <vector>
using namespace std;
int main() {
    vector<int*> memory_sink;
    while (true) { memory_sink.push_back(new int[100000000]); }
}