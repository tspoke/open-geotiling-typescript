import TileArea from "./tile-area";
import TileSize from "./tile-size";
import OpenGeoTile from "./open-geo-tile";

export default class SimpleTileArea extends TileArea {
  private tiles: OpenGeoTile[] = [];
  private smallestTileSize: TileSize = TileSize.GLOBAL;

  public constructor() {
    super();
  }

  public getSmallestTileSize(): TileSize {
    return this.smallestTileSize;
  }

  public contains(tile: OpenGeoTile): boolean {
    return !!(this.tiles.find(memberTile => memberTile.contains(tile)));
  }

  public getCoveringTileArrayList(): OpenGeoTile[] {
    return this.tiles;
  }

  addNonContainedTile(newTile: OpenGeoTile): void {
    this.tiles.push(newTile);
    if (newTile.getTileSize().getCodeLength() > this.smallestTileSize.getCodeLength()) {
      this.smallestTileSize = newTile.getTileSize();
    }
  }
}
