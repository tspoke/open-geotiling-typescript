import {expect} from "chai";
import "mocha";
import OpenGeoTile from "../src/open-geo-tile";

describe("DirectionTest", () => {
  it("testDirections", () => {
    const tile1: OpenGeoTile = OpenGeoTile.buildFromTileAddress("9F53");
    const tile2: OpenGeoTile = OpenGeoTile.buildFromTileAddress("8FX3"); //diff: 4 vertical
    const tile3: OpenGeoTile = OpenGeoTile.buildFromTileAddress("9F5G"); //diff: -9 horizontal
    const tile4: OpenGeoTile = OpenGeoTile.buildFromTileAddress("8FX7"); //diff: -4 hor., 4 vert.;
    const delta = 0.0001;

    expect(Math.PI / 2).approximately(tile1.getDirection(tile2), delta);
    expect(-Math.PI / 2).approximately(tile2.getDirection(tile1), delta);

    expect(Math.PI).approximately(tile1.getDirection(tile3), delta);
    expect(0).approximately(tile3.getDirection(tile1), delta);

    expect(0.75 * Math.PI).approximately(tile1.getDirection(tile4), delta);
    expect(-0.25 * Math.PI).approximately(tile4.getDirection(tile1), delta);
  });
});
