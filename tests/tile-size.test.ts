import "mocha";
import {expect} from "chai";
import OpenGeoTile from "./../src/index";
import TileSize from "./../src/tile-size";
import OpenLocationCode from "open-location-code-typescript";

describe("TileSizeTest", () => {

  it("testGlobalSize", () => {
    const pluscode = "CCXWXWXW+XW";
    const olc = new OpenLocationCode(pluscode);
    const tileSize = TileSize.GLOBAL;
    const codeLength = TileSize.GLOBAL.getCodeLength();

    const block1 = new OpenGeoTile(olc, tileSize);

    expect(codeLength).to.equal(2);
    expect(block1.getTileAddress()).to.equal(pluscode.substring(0, codeLength));
  });

  it("testRegionSize", () => {
    const pluscode = "CCXWXWXW+XW";
    const olc = new OpenLocationCode(pluscode);
    const tileSize = TileSize.REGION;
    const codeLength = TileSize.REGION.getCodeLength();

    const block1 = new OpenGeoTile(olc, tileSize);

    expect(codeLength).to.equal(4);
    expect(block1.getTileAddress()).to.equal(pluscode.substring(0, codeLength));
  });

  it("testDistrictSize", () => {
    const pluscode = "CCXWXWXW+XW";
    const olc = new OpenLocationCode(pluscode);
    const tileSize = TileSize.DISTRICT;
    const codeLength = TileSize.DISTRICT.getCodeLength();

    const block1 = new OpenGeoTile(olc, tileSize);

    expect(codeLength).to.equal(6);
    expect(block1.getTileAddress()).to.equal(pluscode.substring(0, codeLength));
  });

  it("testNeighborhoodSize", () => {
    const pluscode = "CCXWXWXW+XW";
    const olc = new OpenLocationCode(pluscode);
    const tileSize = TileSize.NEIGHBORHOOD;
    const codeLength = TileSize.NEIGHBORHOOD.getCodeLength();

    const block1 = new OpenGeoTile(olc, tileSize);

    expect(codeLength).to.equal(8);
    expect(block1.getTileAddress()).to.equal(pluscode.substring(0, codeLength));
  });

  it("testPinpointSize", () => {
    const pluscode = "CCXWXWXW+XW";
    const olc = new OpenLocationCode(pluscode);
    const tileSize = TileSize.PINPOINT;
    const codeLength = TileSize.PINPOINT.getCodeLength();

    const block1 = new OpenGeoTile(olc, tileSize);

    expect(codeLength).to.equal(10);
    expect(block1.getTileAddress()).to.equal(pluscode.replace("+", ""));
  });
});

