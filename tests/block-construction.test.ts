import {expect} from "chai";
import "mocha";
import OpenGeoTile from "./../src/index";
import OpenLocationCode from "open-location-code-typescript";
import TileSize from "../src/tile-size";

describe("BlockConstructionTest", () => {
  it("constructionsSameBlock", () => {
    const pluscode: string = "CCXWXWXW+XW";
    const olc = new OpenLocationCode(pluscode);
    const tileSize = TileSize.DISTRICT;

    const block1: OpenGeoTile = new OpenGeoTile(olc, tileSize);
    const block2: OpenGeoTile = OpenGeoTile.buildFromPlusCode(pluscode, tileSize);
    const block3: OpenGeoTile = OpenGeoTile.buildFromPlusCode(olc.getCode(), tileSize);
    const block4: OpenGeoTile = OpenGeoTile.buildFromTileAddress(block1.getTileAddress());
    const block5: OpenGeoTile = OpenGeoTile.buildFromTileAddress(block2.getTileAddress());

    expect(block1.isSameTile(block2)).to.equal(true);
    expect(block2.isSameTile(block3)).to.equal(true);
    expect(block3.isSameTile(block4)).to.equal(true);
    expect(block4.isSameTile(block5)).to.equal(true);
    expect(block5.isSameTile(block1)).to.equal(true);
  });
});
