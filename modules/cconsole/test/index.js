/*
 * TODO: Add tests
 */

// https://ivantanev.com/make-jest-faster/
import { describe, expect, test } from "@ts-jest/globals";

import cconsole from "../esm/cconsole.ts";
import cconsoleInit from "../esm/cconsoleInit";
import cconsoleDefault, { cconsoleInit as cconsoleInitDefault } from "../esm/index";

describe("test true describe", function () {
  test("cconsole.ts works without error", (t) => {
    cconsole.success("test");
    t.pass();
  });
  test("cconsoleInit.ts initiates and works without error", (t) => {
    const cconsole = cconsoleInit();
    cconsole.success("test");
    t.pass();
  });
  test("index.ts initiates and works without error", (t) => {
    const cconsole = cconsoleInitDefault();
    cconsole.success("test");
    cconsoleDefault.success("test");
    t.pass();
  });
});
