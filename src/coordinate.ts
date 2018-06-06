export default class Coordinate {
  public constructor(private latitude: number, private longitude: number) {
  }

  public setLatitude(latitude: number) {
    this.latitude = latitude;
  }

  public setLongitude(longitude: number) {
    this.longitude = longitude;
  }

  public getLatitude(): number {
    return this.latitude;
  }

  public getLongitude(): number {
    return this.longitude;
  }
}
