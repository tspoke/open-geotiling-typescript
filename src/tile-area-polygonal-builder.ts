import TileSize from "./tile-size";
import Coordinate from "./coordinate";
import TileArea from "./tile-area";
import OpenGeoTile from "./index";
import MergingTileArea from "./merging-tile-area";

export default class TileAreaPolygonalBuilder {
  //min/max values for latitude and longitude in degrees.
  private static readonly LATITUDE_MIN = -90.0;
  private static readonly LONGITUDE_MIN = -180.0;
  private static readonly LATITUDE_MAX = 90.0;
  private static readonly LONGITUDE_MAX = 180.0;

  //internal state, updated by set* methods
  private precision: TileSize = TileSize.DISTRICT;
  private coordinates: Coordinate[] = null;
  private bboxMin: Coordinate;
  private bboxMax: Coordinate;

  public constructor() {
    //do nothing yet
  }

  /**
   * Set the tile size of {@link OpenGeoTile} that should be contained in the resulting {@link TileArea}
   * @param precision the precision (or minimum size) for elements of the returned TileArea
   * @return this object, to chain additional setters
   */
  public setPrecision(precision: TileSize): TileAreaPolygonalBuilder {
    this.precision = precision;
    return this;
  }

  /**
   * Set an array of coordinates, which will be interpreted as vertices of a closed polygon
   * @param coordinates an array of {@link Coordinate}. Coordinates that are not valid
   *                    latitude/longitude pairs will be dropped, the remaining list needs to
   *                    contain at least three elements to form a valid polygon. The list is not
   *                    checked for problems such as self-intersection.
   * @return this object, to chain additional setters
   */
  public setCoordinatesList(coordinates: Coordinate[]): TileAreaPolygonalBuilder {
    this.coordinates = [];

    //set bounding box to inverted values;
    this.bboxMin = new Coordinate(TileAreaPolygonalBuilder.LATITUDE_MAX, TileAreaPolygonalBuilder.LONGITUDE_MAX);
    this.bboxMax = new Coordinate(TileAreaPolygonalBuilder.LATITUDE_MIN, TileAreaPolygonalBuilder.LONGITUDE_MIN);

    //filter invalid coordinates, update bounding box

    coordinates.forEach(coordinate => {
      if (coordinate.getLatitude() >= TileAreaPolygonalBuilder.LATITUDE_MIN
        && coordinate.getLatitude() <= TileAreaPolygonalBuilder.LATITUDE_MAX
        && coordinate.getLongitude() >= TileAreaPolygonalBuilder.LONGITUDE_MIN
        && coordinate.getLongitude() <= TileAreaPolygonalBuilder.LONGITUDE_MAX) {
        this.coordinates.push(coordinate);

        if (coordinate.getLatitude() < this.bboxMin.getLatitude()) {
          this.bboxMin.setLatitude(coordinate.getLatitude());
        }

        if (coordinate.getLatitude() > this.bboxMax.getLatitude()) {
          this.bboxMax.setLatitude(coordinate.getLatitude());
        }

        if (coordinate.getLongitude() < this.bboxMin.getLongitude()) {
          this.bboxMin.setLongitude(coordinate.getLongitude());
        }

        if (coordinate.getLongitude() > this.bboxMax.getLongitude()) {
          this.bboxMax.setLongitude(coordinate.getLongitude());
        }
      } //coordinate is invalid else; skip it
    });

    return this;
  }

  /**
   * Checks if building the TileArea now would result in a non-null return value
   * @return true, if all necessary values have been set; false otherwise
   */
  public isValid(): boolean {
    if (!this.coordinates) {
      //array list hasn't been set
      return false;
    }
    if (!this.precision) {
      //tile size hasn't been set
      return false;
    }
    return this.coordinates.length > 2;
  }

  /**
   * Build and return a {@link TileArea}
   * @return a TileArea corresponding to the closed polygon input, if all vertices of that polygon
   * are valid lat/long coordinates; a TileArea created from all valid vertices if not; null, if
   * the state of this builder is not valid
   */
  public build(): TileArea {
    //return null value if TileArea could not be constructed
    if (!this.isValid()) {
      return null;
    }

    const rasterizedArea: TileArea = new MergingTileArea();

    //rasterize polygon using scanlines, based on public-domain code by Darel Rex Finley, 2007;
    //http://alienryderflex.com/polygon_fill/

    const increment = this.precision.getCoordinateIncrement();

    //determine min and max latitude/longitude we want to use
    //go through OGT to retrieve center coordinates, pad by one increment to not exclude
    //border tiles in some situations
    const minOGT: OpenGeoTile = OpenGeoTile.buildFromLatitudeAndLongitude(this.bboxMin.getLatitude(), this.bboxMin.getLongitude(), this.precision);
    const maxOGT: OpenGeoTile = OpenGeoTile.buildFromLatitudeAndLongitude(this.bboxMax.getLatitude(), this.bboxMax.getLongitude(), this.precision);
    const minLatitude = minOGT.getWrappedOpenLocationCode().decode().getCenterLatitude() - increment;
    const maxLatitude = maxOGT.getWrappedOpenLocationCode().decode().getCenterLatitude() + increment;
    const minLongitude = minOGT.getWrappedOpenLocationCode().decode().getCenterLongitude() - increment;
    const maxLongitude = maxOGT.getWrappedOpenLocationCode().decode().getCenterLongitude() + increment;

    //loop through latitude ("scanlines")
    for (let latitude = minLatitude; latitude < maxLatitude; latitude += increment) {

      //for each latitude scanline, build a list of intersection points with the polygon
      const intersectionLongitudes: number[] = [];
      let nextIndex = 0;

      let j = this.coordinates.length - 1;
      let i = 0;
      for (i = 0; i < this.coordinates.length; i++) {
        const first = (this.coordinates[i].getLatitude() < latitude && this.coordinates[j].getLatitude() > latitude);
        const second = (this.coordinates[i].getLatitude() > latitude && this.coordinates[j].getLatitude() < latitude);
        if (first || second) {
          //the polygon edge between vertices i and j intersects this latitude scanline;
          //approximate longitudinal value of the intersection point
          intersectionLongitudes[nextIndex] = (this.coordinates[i].getLongitude() +
            ((latitude - this.coordinates[i].getLatitude()))
            / (this.coordinates[j].getLatitude() - this.coordinates[i].getLatitude())
            * (this.coordinates[j].getLongitude() - this.coordinates[i].getLongitude()));
          nextIndex++;
        }

        j = i;
      }

      //Sort the intersection longitudes via a simple bubble sort.
      while (i < nextIndex - 2) { //nextIndex is the first index not filled with valid data, so we need to iterate up to this -2
        if (intersectionLongitudes[i] > intersectionLongitudes[i + 1]) {
          const swap = intersectionLongitudes[i];
          intersectionLongitudes[i] = intersectionLongitudes[i + 1];
          intersectionLongitudes[i + 1] = swap;
          if (i > 0) {
            i--;
          }
        } else {
          i++;
        }
      }

      //add all tiles on this scanline between pairs of intersection longitudes
      for (i = 0; i < nextIndex - 1; i += 2) {
        if (intersectionLongitudes[i] >= maxLongitude) {
          break;
        }

        if (intersectionLongitudes[i + 1] > minLongitude) {
          if (intersectionLongitudes[i] < minLongitude) {
            intersectionLongitudes[i] = minLongitude;
          }

          if (intersectionLongitudes[i + 1] > maxLongitude) {
            intersectionLongitudes[i + 1] = maxLongitude;
          }

          for (let longitude = intersectionLongitudes[i]; longitude < intersectionLongitudes[i + 1]; longitude += increment) {
            //latitude and longitude define a tile inside the polygon; add that to area
            const ogt: OpenGeoTile = OpenGeoTile.buildFromLatitudeAndLongitude(latitude, longitude, this.precision);
            rasterizedArea.addTile(ogt);
          }
        }
      }
    }

    return rasterizedArea;
  }
};