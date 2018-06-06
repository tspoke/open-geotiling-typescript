import "mocha";
import {expect} from "chai";
import OpenGeoTile from "./../src/index";

describe("AdjacencyTest", () => {
  let originalBlock;

  before(() => {
    originalBlock = OpenGeoTile.buildFromTileAddress("8CRW2X");
  });

  it("testAdjacency", () => {
    //neighboring blocks at the same scale are considered adjacent
    [
      OpenGeoTile.buildFromTileAddress("8CRW3W"),
      OpenGeoTile.buildFromTileAddress("8CRW3X"),
      OpenGeoTile.buildFromTileAddress("8CRX32"),
      OpenGeoTile.buildFromTileAddress("8CRX22"),
      OpenGeoTile.buildFromTileAddress("8CQXX2"),
      OpenGeoTile.buildFromTileAddress("8CQWXX"),
      OpenGeoTile.buildFromTileAddress("8CQWXW"),
      OpenGeoTile.buildFromTileAddress("8CRW2W")
    ].forEach(neighbor => {
      expect(originalBlock.isNeighbor(neighbor)).to.equal(true);
    });
  });

  it("testAdjacencyWrapping", () => {
    //adjacency wraps correctly
    const pacificLeft = OpenGeoTile.buildFromTileAddress("8V");
    const pacificRight = OpenGeoTile.buildFromTileAddress("72");
    expect(pacificLeft.isNeighbor(pacificRight)).to.equal(true);
  });

  it("testNonAdjacencyRandomBlock", () => {
    //non-neighboring blocks are not considered adjacent
    const noNeighborBlock = OpenGeoTile.buildFromTileAddress("3FHP99");
    expect(originalBlock.isNeighbor(noNeighborBlock)).to.equal(false);
  });

  it("testAdjacencyDifferentScale", () => {
    //neighboring blocks at different scales are considered adjacent,
    //unless one is contained within the other
    const neighborBlockDifferentSize1 = OpenGeoTile.buildFromTileAddress("8CRW2W8X");
    const neighborBlockDifferentSize2 = OpenGeoTile.buildFromTileAddress("8CRX");
    const containingBlock = OpenGeoTile.buildFromTileAddress("8CRW");

    expect(originalBlock.isNeighbor(neighborBlockDifferentSize1)).to.equal(true);
    expect(originalBlock.isNeighbor(neighborBlockDifferentSize2)).to.equal(true);
    expect(originalBlock.isNeighbor(containingBlock)).to.equal(false);
  });

  it("testNonAdjacencySelf", () => {
    //no block is adjacent to itself, even at the poles
    const polarBlock = OpenGeoTile.buildFromTileAddress("CC");
    expect(originalBlock.isNeighbor(originalBlock)).to.equal(false);
    expect(polarBlock.isNeighbor(polarBlock)).to.equal(false);
  });
});

