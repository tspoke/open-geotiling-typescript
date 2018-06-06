import {expect} from "chai";
import "mocha";
import OpenGeoTile from "./../src/index";

describe("Open Location Code", () => {
  it("returnTileOLC", () => {
    const tile = OpenGeoTile.buildFromTileAddress("C9");
    expect(tile.getTileOpenLocationCode().getCode()).to.equal("C9000000+");
  });
});
