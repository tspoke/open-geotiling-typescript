# open-geotiling-typescript

Open GeoTiling typescript implementation.

The original library can be found here : https://github.com/bocops/open-geotiling

## How to get it ?

```
npm install open-geotiling --save
```

## Usage

### Get approximative direction between OLC

```js
const tile1 = OpenGeoTile.buildFromTileAddress("9F53");
const tile2 = OpenGeoTile.buildFromTileAddress("8FX3");
tile1.getDirection(tile2); // ~= Math.PI / 2
```

### Test adjacency

```js
const originalBlock = OpenGeoTile.buildFromTileAddress("8CRW2X");
[
  OpenGeoTile.buildFromTileAddress("8CRW3W"),
  OpenGeoTile.buildFromTileAddress("8CRW3X")
].forEach(other => {
  if (originalBlock.isNeighbor(other{
    // do something.
  }
});
```

### Membership (contains)

```js
const bigBlock = OpenGeoTile.buildFromTileAddress("8CFF");
const smallBlock = OpenGeoTile.buildFromTileAddress("8CFFXX");
const tinyBlock = OpenGeoTile.buildFromTileAddress("8CFFXXHH");

bigBlock.contains(smallBlock); // true
bigBlock.contains(tinyBlock); // true
```


### Get all GeoTiles for a polygon made of coordinates

```js
const coords = [];
coords.push(new Coordinate(47.475062, -0.552563));
coords.push(new Coordinate(47.469938, -0.552563));
coords.push(new Coordinate(47.469938, -0.547438));
coords.push(new Coordinate(47.475062, -0.547438));

const testTileArea = new TileAreaPolygonalBuilder()
      .setPrecision(TileSize.PINPOINT) // find all tiles for this size
      .setMaximumTileSize(TileSize.NEIGHBORHOOD) // merge tiles to this maximum size (default is setPrecision value)
      .setCoordinatesList(coords)
      .build();
```

## Licence

The project is licensed under the Apache License 2.0.