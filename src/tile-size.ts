/**
 * TileSize class
 */
export default class TileSize {
  /**
   * An area of 20° x 20°. The side length of this tile varies with its location on the globe,
   * but can be up to approximately 2200km. Tile addresses will be 2 characters long.*/
  public static GLOBAL: TileSize = new TileSize(2, 20.0);
  /**
   * An area of 1° x 1°. The side length of this tile varies with its location on the globe,
   * but can be up to approximately 110km. Tile addresses will be 4 characters long.*/
  public static REGION: TileSize = new TileSize(4, 1.0);
  /**
   * An area of 0.05° x 0.05°. The side length of this tile varies with its location on the
   * globe, but can be up to approximately 5.5km. Tile addresses will be 6 characters long.*/
  public static DISTRICT: TileSize = new TileSize(6,0.05);
  /**
   * An area of 0.0025° x 0.0025°. The side length of this tile varies with its location on
   * the globe, but can be up to approximately 275m.
   * Tile addresses will be 8 characters long.*/
  public static NEIGHBORHOOD: TileSize = new TileSize(8,0.0025);
  /**
   * An area of 0.000125° x 0.000125°. The side length of this tile varies with its location
   * on the globe, but can be up to approximately 14m.
   * Tile addresses will be 10 characters long.*/
  public static PINPOINT: TileSize = new TileSize(10,0.000125);

  private constructor(private readonly mCodeLength: number, private readonly mCoordinateIncrement: number){
  }

  public getCodeLength() {
    return this.mCodeLength;
  }

  public getCoordinateIncrement() {
    return this.mCoordinateIncrement;
  }
}