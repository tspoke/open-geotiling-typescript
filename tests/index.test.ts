import {expect} from "chai";
import "mocha";
import OpenLocationCode from "open-location-code-typescript";

describe("Open Geotiling tests", () => {
  it("test", () => {
    OpenLocationCode.isFull("");
    expect(true).to.equal(true);
  });
});
