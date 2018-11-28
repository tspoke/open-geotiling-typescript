import OpenLocationCode from "open-location-code-typescript";
/**
 * An area defined by one or more {@link OpenGeoTile} tiles
 */
import OpenGeoTile from "./open-geo-tile";
import TileSize from "./tile-size";

export default abstract class TileArea {
  /**
   * If tiles exists, construct a TileArea from a list of tiles.
   * @param tiles an ArrayList of tiles that should be added to this object
   */
  protected constructor(tiles?: OpenGeoTile[]) {
    //nothing to do here yet
    if (tiles) {
      tiles.forEach(t => this.addTile(t));
    }
  }

  /**
   * Get a list of tiles that fully cover this TileArea as currently defined. Note that this is
   * not necessarily the same list that went into this object over time. In case of a contiguous
   * TileArea, it can also include tiles that never have been added.
   * @return an ArrayList of {@link OpenGeoTile} tiles which fully cover the area of this TileArea
   */
  public abstract getCoveringTileArrayList(): OpenGeoTile[];

  /**
   * Check if the area defined by {@link OpenGeoTile} tile is completely inside this object's
   * area.
   * @param tile an OpenGeoTile, the area of which will be checked
   * @return true if the whole area of {@code tile} is inside this object's area, false if not
   */
  public abstract contains(tile: OpenGeoTile): boolean;

  /**
   * Gets the {@link org.bocops.opengeotiling.OpenGeoTile.TileSize} of the smallest
   * {@link OpenGeoTile} used to define the area of this object.
   * @return the smallest tile size (=longest address) used by one of the tiles of this area
   */
  public abstract getSmallestTileSize(): TileSize;

  /**
   * Package-private method to add a code that has already been checked to NOT be contained yet.
   * @param newTile a full OpenGeoTile, the area of which will be added to this object's area
   */
  abstract addNonContainedTile(newTile: OpenGeoTile);

  /**
   * Adds the area defined by the {@link OpenGeoTile} newTile to the area represented by this
   * object. Subsequent calls to {@link #contains(OpenGeoTile)} must return true for the
   * same tile address (e.g. "C9C9") as well as for all longer addresses (e.g. "C9C9XXXX")
   * @param newTile a full OpenGeoTile, the area of which will be added to this object's area
   */
  public addTile(newTile: OpenGeoTile): void {
    if ((!this.contains(newTile))) {
      this.addNonContainedTile(newTile);
    }
  }

  /**
   * Adds the area defined by another TileArea to the area represented by this
   * object.
   * @param newTileArea another TileArea
   */
  public addTileArea(newTileArea: TileArea): void {
    newTileArea.getCoveringTileArrayList().forEach(newTile => this.addTile(newTile));
  }

  /**
   * Check if the area defined by {@link OpenGeoTile} code is completely inside this object's
   * area.
   * @param code a full {@link OpenLocationCode}, the area of which will be checked
   * @return true if the whole area of {@code code} is inside this object's area, false if not
   */
  public containsOpenLocationCode(code: OpenLocationCode): boolean {
    return this.contains(new OpenGeoTile(code));
  }

  /**
   * Check if a location is inside this object's area.
   * @param latitude latitude value of the location to be checked
   * @param longitude longitude value of the location to be checked
   * @return true if inside, false if not
   */
  public containsLatitudeLongitude(latitude: number, longitude: number): boolean {
    return this.contains(OpenGeoTile.buildFromLatitudeAndLongitude(latitude, longitude, this.getSmallestTileSize()));
  }
}
