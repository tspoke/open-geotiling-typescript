import TileSize from "./tile-size";
import OpenLocationCode from "open-location-code-typescript";

/**
 * A wrapper around an {@code OpenLocationCode} object, focusing on the area identified by a prefix
 * of the given OpenLocationCode.
 *
 * Using this wrapper class allows to determine whether two locations are in the same or adjacent
 * "tiles", to determine all neighboring tiles of a given one, to calculate a distance in tiles etc.
 *
 * Open Location Code is a technology developed by Google and licensed under the Apache License 2.0.
 * For more information, see https://github.com/google/open-location-code
 *
 * @author Thibaud Giovannetti
 * @from  Andreas Bartels
 * @version 0.1.0
 */
export default class OpenGeoTile {
  // A separator used to break the code into two parts to aid memorability.
  private static readonly SEPARATOR = "+";

  // Copy from OpenLocationCode.java
  // The character used to pad codes.
  private static readonly PADDING_CHARACTER = "0";
  private static readonly PADDING_2 = "00";
  private static readonly PADDING_4 = "0000";
  private static readonly PADDING_6 = "000000";

  private mOpenLocationCode: OpenLocationCode;
  private mTileSize: TileSize;

  /**
   * Creates a new OpenGeoTile from an existing
   *
   * {@link com.google.openlocationcode.OpenLocationCode}.
   * @param olc OpenLocationCode for the current location
   * @param tileSize tile size to use for this OpenGeoTile
   * @throws IllegalArgumentException when trying to pass a short (non-full) OLC, or if OLC has
   * too much padding for given tileSize
   */
  public constructor(olc: OpenLocationCode, tileSize: TileSize = null) {
    if (!olc || !olc.getCode || !OpenLocationCode.isFull(olc.getCode())) {
      throw new Error("Only full OLC supported. Use recover().");
    }

    if (!tileSize) {
      let codeLength;
      if (olc.isPadded()) {
        codeLength = olc.getCode().indexOf(OpenGeoTile.PADDING_CHARACTER);
      } else {
        codeLength = Math.min(olc.getCode().length() - 1, 10);
      }

      if (codeLength === TileSize.GLOBAL.getCodeLength()) {
        this.mTileSize = TileSize.GLOBAL;
      }
      if (codeLength === TileSize.REGION.getCodeLength()) {
        this.mTileSize = TileSize.REGION;
      }
      if (codeLength === TileSize.DISTRICT.getCodeLength()) {
        this.mTileSize = TileSize.DISTRICT;
      }
      if (codeLength === TileSize.NEIGHBORHOOD.getCodeLength()) {
        this.mTileSize = TileSize.NEIGHBORHOOD;
      }
      if (codeLength === TileSize.PINPOINT.getCodeLength()) {
        this.mTileSize = TileSize.PINPOINT;
      }
    } else {
      if (olc.isPadded()) {
        if (olc.getCode().indexOf(OpenGeoTile.PADDING_CHARACTER) < tileSize.getCodeLength()) {
          throw new Error("OLC padding larger than allowed by tileSize");
        }
      }
      this.mTileSize = tileSize;
    }

    this.mOpenLocationCode = olc;
  }

  /**
   * Creates a new OpenGeoTile from lat/long coordinates.
   * @param latitude latitude of the location
   * @param longitude longitude of the location
   * @param tileSize tile size to use for this OpenGeoTile
   * @throws IllegalArgumentException passed through from
   *         {@link OpenLocationCode#OpenLocationCode(double, double, int)}
   */
  public static buildFromLatitudeAndLongitude(latitude: number, longitude: number, tileSize: TileSize): OpenGeoTile {
    const plusCode = OpenLocationCode.encode(latitude, longitude, TileSize.PINPOINT.getCodeLength());
    return OpenGeoTile.buildFromPlusCode(plusCode, tileSize);
  }

  /**
   * Creates a new OpenGeoTile from a tile address.
   * @param tileAddress a tile address is a [2/4/6/8/10]-character string that corresponds to a
   *                     valid {@link com.google.openlocationcode.OpenLocationCode} after removing
   *                     '+' and an additional number of trailing characters; tile size is
   *                     determined by the length of this address
   * @throws IllegalArgumentException passed through from
   *         {@link OpenLocationCode#OpenLocationCode(String)} or thrown if tileAddress is of
   *         invalid length
   */
  public static buildFromTileAddress(tileAddress: string): OpenGeoTile {
    let detectedTileSize: TileSize = null;
    let olcBuilder: string = "";

    if (tileAddress.length === TileSize.GLOBAL.getCodeLength()) {
      detectedTileSize = TileSize.GLOBAL;
      olcBuilder += tileAddress;
      olcBuilder += OpenGeoTile.PADDING_6;
      olcBuilder += OpenGeoTile.SEPARATOR;
    }

    if (tileAddress.length === TileSize.REGION.getCodeLength()) {
      detectedTileSize = TileSize.REGION;
      olcBuilder += (tileAddress);
      olcBuilder += (OpenGeoTile.PADDING_4);
      olcBuilder += (OpenGeoTile.SEPARATOR);
    }

    if (tileAddress.length === TileSize.DISTRICT.getCodeLength()) {
      detectedTileSize = TileSize.DISTRICT;
      olcBuilder += (tileAddress);
      olcBuilder += (OpenGeoTile.PADDING_2);
      olcBuilder += (OpenGeoTile.SEPARATOR);
    }

    if (tileAddress.length === TileSize.NEIGHBORHOOD.getCodeLength()) {
      detectedTileSize = TileSize.NEIGHBORHOOD;
      olcBuilder += (tileAddress);
      olcBuilder += (OpenGeoTile.SEPARATOR);
    }

    if (tileAddress.length === TileSize.PINPOINT.getCodeLength()) {
      detectedTileSize = TileSize.PINPOINT;
      olcBuilder += (tileAddress.substring(0, 8));
      olcBuilder += (OpenGeoTile.SEPARATOR);
      olcBuilder += (tileAddress.substring(8, 10));
    }

    if (!detectedTileSize) {
      throw new Error("Invalid tile address");
    }

    const olc = new OpenLocationCode(olcBuilder);
    return new OpenGeoTile(olc, detectedTileSize);
  }

  /**
   * Creates a new OpenGeoTile from an Open Location Code.
   * @param pluscode the Open Location Code
   * @param tileSize the tile size to use
   * @throws IllegalArgumentException passed through from
   *         {@link OpenLocationCode#OpenLocationCode(String)}
   */
  public static buildFromPlusCode(pluscode: string, tileSize: TileSize): OpenGeoTile {
    let intermediate: OpenLocationCode = new OpenLocationCode(pluscode);
    if (!OpenLocationCode.isFull(pluscode)) {
      throw new Error("Only full OLC supported. Use recover().");
    }
    return new OpenGeoTile(intermediate, tileSize);
  }

  /**
   * The exact {@link com.google.openlocationcode.OpenLocationCode} wrapped by this OpenGeoTile.
   * For the plus code of the whole tile, see {@link #getTileOpenLocationCode()}.
   * @return the exact plus code wrapped by this OpenGeoTile
   */
  public getWrappedOpenLocationCode(): OpenLocationCode {
    return this.mOpenLocationCode;
  }

  /**
   * Get the {@link TileSize} of this OpenGeoTile.
   * @return the {@link TileSize} of this OpenGeoTile
   */
  public getTileSize(): TileSize {
    return this.mTileSize;
  }

  /**
   * A tile address is a string of length 2, 4, 6, 8, or 10, which corresponds to a valid
   * {@link com.google.openlocationcode.OpenLocationCode} after padding with an appropriate
   * number of '0' and '+' characters. Example: Address "CVXW" corresponds to OLC "CVXW0000+"
   * @return the tile address of this OpenGeoTile;
   */
  public getTileAddress(): string {
    const intermediate = this.mOpenLocationCode.getCode().replace(OpenGeoTile.SEPARATOR, "");
    return intermediate.substring(0, this.mTileSize.getCodeLength());
  }

  /**
   * The prefix of a tile address is the address of the next biggest tile at this location.
   * @return this tile's address with the final two characters removed. In case of a GLOBAL tile,
   * returns the empty string.
   */
  public getTileAddressPrefix(): string {
    if (this.mTileSize === TileSize.GLOBAL) {
      return "";
    } else {
      return this.getTileAddress().substring(0, this.mTileSize.getCodeLength() - 2);
    }
  }

  /**
   * The full {@link com.google.openlocationcode.OpenLocationCode} for this tile. Other than
   * {@link #getWrappedOpenLocationCode()}, this will return a full plus code for the whole tile.
   * @return a plus code for the whole tile, probably padded with '0' characters
   */
  public getTileOpenLocationCode(): OpenLocationCode {
    const intermediate: OpenGeoTile = OpenGeoTile.buildFromTileAddress(this.getTileAddress());
    return intermediate.getWrappedOpenLocationCode();
  }

  /**
   * Get an array of the typically 8  neighboring tiles of the same size.
   * @return an array of the typically 8 neighboring tiles of the same size;
   * may return less than 8 neighbors for tiles near the poles.
   */
  public getNeighbors(): OpenGeoTile[] {
    const deltas: number[] = [20.0, 1.0, 0.05, 0.0025, 0.000125];
    const delta: number = deltas[(this.getTileSize().getCodeLength() - 2) / 2];

    const codeArea: OpenLocationCode.CodeArea = OpenLocationCode.decode(this.mOpenLocationCode.code);
    const latitude: number = codeArea.latitudeCenter;
    const longitude: number = codeArea.longitudeCenter;

    const latDiff: number[] = [+1, +1, +1, 0, -1, -1, -1, 0];
    const lngDiff: number[] = [-1, 0, +1, +1, +1, 0, -1, -1];

    const arNeighbors: OpenGeoTile[] = [];

    for (let i = 0; i < 8; i++) {
      //OLC constructor clips and normalizes,
      //so we don't have to deal with invalid lat/long values directly
      const neighborLatitude: number = latitude + (delta * latDiff[i]);
      const neighborLongitude: number = longitude + (delta * lngDiff[i]);

      const n: OpenGeoTile = OpenGeoTile.buildFromLatitudeAndLongitude(neighborLatitude, neighborLongitude, this.getTileSize());
      if (!n.isSameTile(this)) {
        //don't add tiles that are the same as this one due to clipping near the poles
        arNeighbors.push(n);
      }
    }

    return arNeighbors;
  }

  /**
   * Check if a tile describes the same area as this one.
   * @param potentialSameTile the OpenGeoTile to check
   * @return true if tile sizes and addresses are the same; false if not
   */
  public isSameTile(potentialSameTile: OpenGeoTile): boolean {
    if (potentialSameTile.getTileSize() !== this.mTileSize) {
      return false;
    }
    return potentialSameTile.getTileAddress() === this.getTileAddress();
  }

  /**
   * Check if a tile is neighboring this one.
   * @param potentialNeighbor the OpenGeoTile to check
   * @return true if this and potentialNeighbor are adjacent (8-neighborhood);
   *         false if not
   */
  public isNeighbor(potentialNeighbor: OpenGeoTile): boolean {
    if (potentialNeighbor.getTileSize() == this.mTileSize) {
      //avoid iterating over neighbors for same tile
      if (potentialNeighbor.isSameTile(this)) {
        return false;
      }
      return !!(this.getNeighbors().find(n => potentialNeighbor.isSameTile(n)));
    } else {
      //tiles of different size are adjacent if at least one neighbor of the smaller tile,
      //but not the smaller tile itself, is contained within the bigger tile
      let smallerTile: OpenGeoTile;
      let biggerTile: OpenGeoTile;
      if (potentialNeighbor.getTileSize().getCodeLength() > this.mTileSize.getCodeLength()) {
        smallerTile = potentialNeighbor;
        biggerTile = this;
      } else {
        smallerTile = this;
        biggerTile = potentialNeighbor;
      }

      if (biggerTile.contains(smallerTile)) {
        return false;
      }

      return !!(smallerTile.getNeighbors().find(n => biggerTile.contains(n)));
    }
  }

  /**
   * Check if this tile contains another one.
   * @param potentialMember the OpenGeoTile to check
   * @return true if the area potentialMember falls within the area of this tile, including cases
   * where both are the same; false if not
   */
  public contains(potentialMember: OpenGeoTile): boolean {
    //if A contains B, then B's address has A's address as a prefix
    return potentialMember.getTileAddress().startsWith(this.getTileAddress());
  }

  /**
   * Calculates the Manhattan (city block) distance between this and another tile of the same size.
   * @param otherTile another tile of the same size as this one
   * @return an integer value corresponding to the number of tiles of the given size that need to
   * be traversed getting from one to the other tile
   * @throws IllegalArgumentException thrown if otherTile has different {@link TileSize}
   */
  public getManhattanTileDistanceTo(otherTile: OpenGeoTile): number {
    if (otherTile.getTileSize() !== this.mTileSize) {
      throw new Error("Tile sizes don't match");
    }
    return this.getLatitudinalTileDistance(otherTile, true) + this.getLongitudinalTileDistance(otherTile, true);
  }

  /**
   * Calculates the Chebyshev (chessboard) distance between this and another tile of the same size.
   * @param otherTile another tile of the same size as this one
   * @return an integer value corresponding to the number of tiles of the given size that need to
   * be traversed getting from one to the other tile
   * @throws IllegalArgumentException thrown if otherTile has different {@link TileSize}
   */
  public getChebyshevTileDistanceTo(otherTile: OpenGeoTile): number {
    if (otherTile.getTileSize() !== this.mTileSize) {
      throw new Error("Tile sizes don't match");
    }
    return Math.max(this.getLatitudinalTileDistance(otherTile, true), this.getLongitudinalTileDistance(otherTile, true));
  }

  /**
   * Returns the approximate direction of the other tile relative to this. The return value can
   * have a large margin of error, especially for big or far away tiles, so this should only be
   * interpreted as a very rough approximation and used as such.
   * @param otherTile another tile of the same size as this one
   * @return an angle in radians, 0 being an eastward direction, +/- PI being westward direction
   * @throws IllegalArgumentException thrown if otherTile has different {@link TileSize}
   */
  public getDirection(otherTile: OpenGeoTile): number {
    if (otherTile.getTileSize() !== this.mTileSize) {
      throw new Error("Tile sizes don't match");
    }

    const xDiff = this.getLongitudinalTileDistance(otherTile, false);
    const yDiff = this.getLatitudinalTileDistance(otherTile, false);
    return Math.atan2(yDiff, xDiff);
  }

  private static getCharacterIndex(c: string): number {
    //following definitions copied from OpenLocationCode.java
    const ALPHABET: string = "23456789CFGHJMPQRVWX";
    const CHARACTER_TO_INDEX: object = {}; // string -> int

    for (let index = 0; index < ALPHABET.length; index++) {
      const lowerCaseCharacter = ALPHABET.charAt(index).toLowerCase();
      CHARACTER_TO_INDEX[ALPHABET.charAt(index)] = index;
      CHARACTER_TO_INDEX[lowerCaseCharacter] = index;
    }

    //end copy from OpenLocationCode.java
    if (!CHARACTER_TO_INDEX[c]) {
      throw new Error("Character does not exist in alphabet");
    }

    return CHARACTER_TO_INDEX[c];
  }

  private static characterDistance(c1: string, c2: string): number {
    return this.getCharacterIndex(c1) - this.getCharacterIndex(c2);
  }

  private getLatitudinalTileDistance(otherTile: OpenGeoTile, absolute: boolean): number {
    if (otherTile.getTileSize() != this.mTileSize) {
      throw new Error("Tile sizes don't match");
    }

    const numIterations = this.mTileSize.getCodeLength() / 2; //1..5
    let tileDistance = 0;
    for (let i = 0; i < numIterations; i++) {
      tileDistance *= 20;
      const c1 = this.getTileAddress().charAt(i * 2);
      const c2 = otherTile.getTileAddress().charAt(i * 2);
      tileDistance += OpenGeoTile.characterDistance(c1, c2);
    }

    if (absolute) {
      return Math.abs(tileDistance);
    }
    return tileDistance;
  }

  private getLongitudinalTileDistance(otherTile: OpenGeoTile, absolute: boolean): number {
    if (otherTile.getTileSize() != this.mTileSize) {
      throw new Error("Tile sizes don't match");
    }

    const numIterations = this.mTileSize.getCodeLength() / 2; //1..5
    let tileDistance = 0;
    for (let i = 0; i < numIterations; i++) {
      tileDistance *= 20;
      const c1 = this.getTileAddress().charAt(i * 2 + 1);
      const c2 = otherTile.getTileAddress().charAt(i * 2 + 1);
      if (i == 0) {
        //for the first longitudinal value, we need to take care of wrapping - basically,
        //if it's shorter to go the other way around, do so
        let firstDiff = OpenGeoTile.characterDistance(c1, c2);
        const NUM_CHARACTERS_USED = 18; //360°/20° = 18
        if (Math.abs(firstDiff) > (NUM_CHARACTERS_USED / 2)) {
          if (firstDiff > 0) {
            firstDiff -= NUM_CHARACTERS_USED;
          } else {
            firstDiff += NUM_CHARACTERS_USED;
          }
        }
        tileDistance += firstDiff;
      } else {
        tileDistance += OpenGeoTile.characterDistance(c1, c2);
      }
    }

    if (absolute) {
      return Math.abs(tileDistance);
    }
    return tileDistance;
  }
}