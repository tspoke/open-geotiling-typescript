import TileArea from "./tile-area";
import TileSize from "./tile-size";
import OpenGeoTile from "./index";

export default class MergingTileArea extends TileArea {
  private static readonly MIN_SUBTILES_PER_TILE = 2; //0 or 1 would lead to all additions snowballing into a full global tile immediately.
  private static readonly MAX_SUBTILES_PER_TILE = 400; //20*20
  private static readonly GLOBAL_KEY = "0";

  //keeping tiles in a HashMap of ArrayLists, to keep track of tiles with the same address prefix
  private tilesHashMap: object = {}; // {key : OpenGeoTile[]}
  private subtilesPerTile: number = MergingTileArea.MAX_SUBTILES_PER_TILE;
  private smallestTileSize: TileSize = TileSize.GLOBAL;
  private maxAllowedTileSize: TileSize = TileSize.GLOBAL;

  public constructor(subtilesPerTile?: number) {
    super();

    if (subtilesPerTile !== null && subtilesPerTile !== undefined) {
      if (subtilesPerTile < MergingTileArea.MIN_SUBTILES_PER_TILE) {
        this.subtilesPerTile = MergingTileArea.MIN_SUBTILES_PER_TILE;
      } else if (subtilesPerTile > MergingTileArea.MAX_SUBTILES_PER_TILE) {
        this.subtilesPerTile = MergingTileArea.MAX_SUBTILES_PER_TILE;
      } else {
        this.subtilesPerTile = subtilesPerTile;
      }
    }
  }

  public withMaxTileSize(maxAllowedTileSize: TileSize): MergingTileArea {
    this.maxAllowedTileSize = maxAllowedTileSize;
    return this;
  }

  public getSmallestTileSize(): TileSize {
    return this.smallestTileSize;
  }

  public contains(tile: OpenGeoTile): boolean {
    let addressPrefix = tile.getTileAddress();

    //iterate over all address prefixes of the input tile
    while (addressPrefix.length > 0) {
      //remove final two characters from addressPrefix
      addressPrefix = addressPrefix.substring(0, addressPrefix.length - 2);
      let key = addressPrefix;
      if (addressPrefix.length === 0) {
        key = MergingTileArea.GLOBAL_KEY;
      }

      //if the address prefix is key in the hashmap, we potentially have a match
      if (this.tilesHashMap[key]) {
        const tiles: OpenGeoTile[] = this.tilesHashMap[key];
        //check all tiles contained in this arraylist
        if (!!(tiles.find(memberTile => memberTile.contains(tile)))) {
          return true;
        }
      }
    }

    return false;
  }

  public getCoveringTileArrayList(): OpenGeoTile[] {
    const output: OpenGeoTile[] = [];
    Object.keys(this.tilesHashMap).forEach(k => output.push(this.tilesHashMap[k]));
    return output;
  }

  public addNonContainedTile(newTile: OpenGeoTile): void {
    let tilePrefix: string = newTile.getTileAddressPrefix();
    if (tilePrefix.length === 0) {
      tilePrefix = MergingTileArea.GLOBAL_KEY;
    }
    if (this.tilesHashMap[tilePrefix]) {
      const tiles: OpenGeoTile[] = this.tilesHashMap[tilePrefix];
      //we're NOT merging the group of tiles this newTile belongs to, if
      //adding a tile means that this would still not be a complete bigger tile; add it	            // 1. the group is not complete yet
      // 2. the group already consists of GLOBAL-sized tiles
      // 3. the tile size already is or exceeds the maximum allowed tile size
      if (tiles.length < this.subtilesPerTile - 1
        || tilePrefix === MergingTileArea.GLOBAL_KEY
        || newTile.getTileAddress().length <= this.maxAllowedTileSize.getCodeLength()) {
        //adding a tile means that this would still not be a complete bigger tile; add it
        tiles.push(newTile);
        this.tilesHashMap[tilePrefix] = tiles;
        if (newTile.getTileSize().getCodeLength() > this.smallestTileSize.getCodeLength()) {
          this.smallestTileSize = newTile.getTileSize();
        }
      } else {
        //adding this tile completes the list to a bigger tile; remove the list, and call
        //this method recursively with the bigger tile. We can be sure that this bigger tile
        //is not contained yet, either; if it was, the initial call to contains() would have
        //returned true;
        delete this.tilesHashMap[tilePrefix];
        const biggerTile: OpenGeoTile = OpenGeoTile.buildFromTileAddress(newTile.getTileAddressPrefix());
        this.addNonContainedTile(biggerTile);
      }
    } else {
      //we don't have an entry for this tilePrefix yet; create it and add tile
      const tiles: OpenGeoTile[] = [];
      tiles.push(newTile);
      this.tilesHashMap[tilePrefix] = tiles;
    }
  }
}