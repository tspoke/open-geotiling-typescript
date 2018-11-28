import "mocha";
import {expect} from "chai";
import OpenGeoTile from "../src/open-geo-tile";

describe("MemberTest", () => {
  it("testMembership", () => {
    const bigBlock = OpenGeoTile.buildFromTileAddress("8CFF");
    const smallBlock = OpenGeoTile.buildFromTileAddress("8CFFXX");
    const tinyBlock = OpenGeoTile.buildFromTileAddress("8CFFXXHH");

    expect(bigBlock.contains(smallBlock)).to.equal(true);
    expect(bigBlock.contains(tinyBlock)).to.equal(true);
    expect(smallBlock.contains(tinyBlock)).to.equal(true);
    expect(bigBlock.contains(bigBlock)).to.equal(true);
    expect(smallBlock.contains(bigBlock)).to.equal(false);
  });

  it("testNonMembership", () => {
    const smallBlock = OpenGeoTile.buildFromTileAddress("8CFFXX");
    const tinyBlock = OpenGeoTile.buildFromTileAddress("8CXXHHFF");
    expect(smallBlock.contains(tinyBlock)).to.equal(false);
  });
});

