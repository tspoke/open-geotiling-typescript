import "mocha";
import {expect} from "chai";
import TileSize from "../src/tile-size";
import TileAreaPolygonalBuilder from "../src/tile-area-polygonal-builder";
import Coordinate from "../src/coordinate";
import MergingTileArea from "../src/merging-tile-area";

describe.only("Custom tests", () => {

  it("Small square test", () => {
    const coords = [];
    coords.push(new Coordinate(47.475062, -0.552563));
    coords.push(new Coordinate(47.469938, -0.552563)); //
    coords.push(new Coordinate(47.469938, -0.547438));
    coords.push(new Coordinate(47.475062, -0.547438)); //

    const shouldBeFound = {
      "FCFX": true, "FFF2": true,
      "FCCX": true, "FFC2": true
    };

    const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.PINPOINT)
      .setMaximumTileSize(TileSize.NEIGHBORHOOD)
      .setCoordinatesList(coords)
      .build();

    console.log("LENGTH NEIGHBORHOOD => " + (<MergingTileArea> testTileArea).getTilesForPrecision(TileSize.NEIGHBORHOOD).length);
    console.log("LENGTH PINPOINT => " + (<MergingTileArea> testTileArea).getTilesForPrecision(TileSize.PINPOINT).length);
    console.log("---------------- ");
    testTileArea.getCoveringTileArrayList().forEach(tile => {
      const smallCode = tile.getTileOpenLocationCode().getCode().replace("8CVX", "").replace("+", "");
      console.log(smallCode);
    });
    expect(!!testTileArea).to.equal(true);
    let found = 0;
    testTileArea.getCoveringTileArrayList().forEach(tile => {
      const smallCode = tile.getTileOpenLocationCode().getCode().replace("8CVX", "").replace("+", "");
      expect(shouldBeFound[smallCode]).to.equal(true, "Code : " + smallCode);
      found++;
    });
    expect(found).to.equal(4);
  });

  it.only("Big square test", () => {
    const coords = [];
    coords.push(new Coordinate(47.470562, -0.563563));
    coords.push(new Coordinate(47.473438, -0.558688));
    coords.push(new Coordinate(47.478062, -0.554688));
    coords.push(new Coordinate(47.473687, -0.545313));
    coords.push(new Coordinate(47.470187, -0.548063));
    coords.push(new Coordinate(47.466562, -0.553062));

    const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.PINPOINT)
      .setMaximumTileSize(TileSize.NEIGHBORHOOD)
      .setCoordinatesList(coords)
      .build();

    console.log("LENGTH NEIGHBORHOOD => " + (<MergingTileArea> testTileArea).getTilesForPrecision(TileSize.NEIGHBORHOOD).length);
    (<MergingTileArea> testTileArea).getTilesForPrecision(TileSize.NEIGHBORHOOD).forEach(t => {
      console.log(t.getTileOpenLocationCode().getCode());
    });
    console.log("LENGTH PINPOINT => " + (<MergingTileArea> testTileArea).getTilesForPrecision(TileSize.PINPOINT).length);
  });
});
