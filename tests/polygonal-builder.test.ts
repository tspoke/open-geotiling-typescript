import "mocha";
import {expect} from "chai";
import OpenGeoTile from "./../src/index";
import TileSize from "./../src/tile-size";
import Coordinate from "./../src/coordinate";
import TileAreaPolygonalBuilder from "./../src/tile-area-polygonal-builder";

describe("PolygonalBuilderTest", () => {

  it("testNullPolygon", () => {
    //not setting a polygon results in null tileArea
    const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.NEIGHBORHOOD)
      .build();
    expect(testTileArea).to.equal(null);
  });

  it("testInvalidPolygon", () => {
    //setting an invalid polygon (only two valid vertices) results in null tileArea
    const coords: Coordinate[] = [];
    coords.push(new Coordinate(0, 0));
    coords.push(new Coordinate(1.0, 1.0));
    coords.push(new Coordinate(500.0, 500.0)); //invalid, will be removed

    const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.NEIGHBORHOOD)
      .setCoordinatesList(coords)
      .build();
    expect(testTileArea).to.equal(null);
  });

  it("testValidPolygonSquare", () => {
    //defining a large, axis-aligned area; locations within, even close to the edge,
    //should be contained
    const coords: Coordinate[] = [];
    coords.push(new Coordinate(0.0, 0.0));
    coords.push(new Coordinate(0.0, 1.0));
    coords.push(new Coordinate(1.0, 1.0));
    coords.push(new Coordinate(1.0, 0.0));

    const corner1 = OpenGeoTile.buildFromLatitudeAndLongitude(0.01, 0.01, TileSize.NEIGHBORHOOD);
    const corner2 = OpenGeoTile.buildFromLatitudeAndLongitude(0.01, 0.99, TileSize.NEIGHBORHOOD);
    const corner3 = OpenGeoTile.buildFromLatitudeAndLongitude(0.99, 0.99, TileSize.NEIGHBORHOOD);
    const corner4 = OpenGeoTile.buildFromLatitudeAndLongitude(0.99, 0.01, TileSize.NEIGHBORHOOD);
    const center = OpenGeoTile.buildFromLatitudeAndLongitude(0.5, 0.5, TileSize.NEIGHBORHOOD);

    const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.DISTRICT)
      .setCoordinatesList(coords)
      .build();

    expect(testTileArea).to.not.equal(null);
    expect(testTileArea.contains(corner1)).to.equal(true, "Contains area near corner 1");
    // expect(testTileArea.contains(corner2)).to.equal(true, "Contains area near corner 2");
    // expect(testTileArea.contains(corner3)).to.equal(true, "Contains area near corner 3");
    expect(testTileArea.contains(corner4)).to.equal(true, "Contains area near corner 4");
    expect(testTileArea.contains(center)).to.equal(true, "Contains center");
  });

  it("testValidLargePolygon", function () {
    //defining a very large area of 10x10x20x20 = 40K small tiles, which could also
    //be represented by a small number of larger tiles (10x10 = 100 REGION-sized tiles);
    //this test should finish in an acceptable time
    this.timeout(10000);
    const coords: Coordinate[] = [];
    coords.push(new Coordinate(0.0, 0.0));
    coords.push(new Coordinate(0.0, 10.0));
    coords.push(new Coordinate(10.0, 10.0));
    coords.push(new Coordinate(10.0, 0.0));

    const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.DISTRICT)
      .setCoordinatesList(coords)
      .build();
    expect(testTileArea).to.not.equal(null);
  });

  it("testGlobalSize", () => {
    //edges not axis-aligned should work as well
    const coords: Coordinate[] = [];
    coords.push(new Coordinate(0.25, 0.25));
    coords.push(new Coordinate(0.25, 0.75));
    coords.push(new Coordinate(0.75, 0.5));

    const ogt = OpenGeoTile.buildFromLatitudeAndLongitude(0.5, 0.5, TileSize.NEIGHBORHOOD);

    const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.DISTRICT)
      .setCoordinatesList(coords)
      .build();
    expect(testTileArea).to.not.equal(null);
    expect(testTileArea.contains(ogt)).to.equal(true);
  });
});

