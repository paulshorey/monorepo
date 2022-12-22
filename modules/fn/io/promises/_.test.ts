import arr_each_promise_all from "./arr_each_promise_all";
import sleep from "./sleep";
import round from "../num/round";

describe("promises", () => {
  it("sleep", async () => {
    const start = Date.now();
    await sleep(100);
    const end = Date.now();
    const roundedTime = round(end - start, 10);
    expect(roundedTime).toBe(100); // sleep() should have stopped for approximately 100ms
  });

  it("arr_each_promise_all", async () => {
    let total = 0;
    let promiseFunction = async (add) => {
      total += add || 1;
    };
    await arr_each_promise_all([1, 2, 3, 4, 5], promiseFunction);
    expect(total).toBe(15);
    await arr_each_promise_all([], promiseFunction);
    expect(total).toBe(15);
  });
});
