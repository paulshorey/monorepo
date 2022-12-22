import call_later from "./call_later";
import throttle from "./throttle";
import debounce from "./debounce";
import sleep from "../promises/sleep";

describe("curry", () => {
  it("call_later", () => {
    const functionToCallLater = (arg1: number, arg2: number) => {
      return arg1 + arg2;
    };
    let curriedFunction = call_later(functionToCallLater, [22, 33]);
    let functionReturnValue = curriedFunction();
    expect(functionReturnValue).toBe(55);
  });

  it("throttle (supports multiple at the same time)", async () => {
    let mA: string[] = [];
    let mB: string[] = [];
    const fA = throttle((str: string) => {
      mA.push(str);
    }, 100);
    const fB = throttle((str: string) => {
      mB.push(str);
    }, 100);
    fA("one");
    fA("two");
    fA("three");
    fB("one");
    fB("two");
    fB("three");
    await sleep(150); // wait for throttle to finish
    expect(mA).toStrictEqual(["one"]);
    expect(mB).toStrictEqual(["one"]);
  });

  it("debounce (supports multiple at the same time)", async () => {
    let mA: string[] = [];
    let mB: string[] = [];
    const fA = debounce((str: string) => {
      mA.push(str);
    }, 100);
    const fB = debounce((str: string) => {
      mB.push(str);
    }, 100);
    fA("one");
    fA("two");
    fA("three");
    fB("one");
    fB("two");
    fB("three");
    await sleep(150); // wait for debounce to finish
    expect(mA).toStrictEqual(["three"]);
    expect(mB).toStrictEqual(["three"]);
  });
});
