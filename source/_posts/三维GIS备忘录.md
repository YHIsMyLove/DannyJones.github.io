
---
title: 三维GIS备忘录
date: 2023-08-02
author: DannyJones
img: /medias/banner/1.jpg
top: false
hide: false
cover: true
coverImg: /medias/banner/1.jpg
password: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
toc: true
mathjax: true
categories:

- GIS
tags:
- GIS

---

## 球体

球体为人为定义的一组三维向量描述准备绘制球体的三个轴向的半径长度;

```js
// 经纬度椭球体
const WGS84Ellipsoid = new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793)
// 经纬度圆球
const WGS84SPHERE = new Ellipsoid(6378137.0, 6378137.0, 6378137.0)
// 月球
const MOON = new Ellipsoid(1737400.0, 1737400.0, 1737400.0)
```

## 地理矩形

由经纬度组成的二维矩形框,最大值为 [-180,-90,180,90]

## 投影

### 经纬度投影(EPSG:4326)

经纬度坐标(弧度)投影到地图坐标(米),X和Y分别为经度和纬度，乘以[球体](#球体)的半径
Z为高度

```js
function(cartographic) {
  const semimajorAxis = this._semimajorAxis;
  const x = cartographic.longitude * semimajorAxis;
  const y = cartographic.latitude * semimajorAxis;
  const z = cartographic.height;
  if (!defined(result)) {
    return new Cartesian3(x, y, z);
  }
  result.x = x;
  result.y = y;
  result.z = z;
  return result;
};

```

### 墨卡托投影(EPSG:3857)

```js
/**
 * Converts a geodetic latitude in radians, in the range -PI/2 to PI/2, to a Mercator
 * angle in the range -PI to PI.
 * @param {number} latitude The geodetic latitude in radians.
 * @returns {number} The Mercator angle.
 */
WebMercatorProjection.geodeticLatitudeToMercatorAngle = function (latitude) {
  // Clamp the latitude coordinate to the valid Mercator bounds.
  if (latitude > WebMercatorProjection.MaximumLatitude) {
    latitude = WebMercatorProjection.MaximumLatitude;
  } else if (latitude < -WebMercatorProjection.MaximumLatitude) {
    latitude = -WebMercatorProjection.MaximumLatitude;
  }
  const sinLatitude = Math.sin(latitude);
  return 0.5 * Math.log((1.0 + sinLatitude) / (1.0 - sinLatitude));
};

/**
 * Converts geodetic ellipsoid coordinates, in radians, to the equivalent Web Mercator
 * X, Y, Z coordinates expressed in meters and returned in a {@link Cartesian3}.  The height
 * is copied unmodified to the Z coordinate.
 *
 * @param {Cartographic} cartographic The cartographic coordinates in radians.
 * @param {Cartesian3} [result] The instance to which to copy the result, or undefined if a
 *        new instance should be created.
 * @returns {Cartesian3} The equivalent web mercator X, Y, Z coordinates, in meters.
 */
function (cartographic, result) {
  const semimajorAxis = this._semimajorAxis;
  const x = cartographic.longitude * semimajorAxis;
  const y =
    WebMercatorProjection.geodeticLatitudeToMercatorAngle(
      cartographic.latitude
    ) * semimajorAxis;
  const z = cartographic.height;
  if (!defined(result)) {
    return new Cartesian3(x, y, z);
  }
  result.x = x;
  result.y = y;
  result.z = z;
  return result;
};
```

## 切片规则(TilingScheme)

在地球表面上的几何形状或是图像的平铺方案。
规定零层的大小,然后按照零层配置的大小遍历后续的级别。

一般情况下可以细分为:

### 地理切片规则

经纬度直接映射到X/Y,默认情况下 **X**方向 为**2**个瓦片,**Y**方向 **1** 个瓦片,及将球面看做一个[地理矩形](#地理矩形)
切割成两个正方形;
层级和个数的公式为:X方向的个数为为 2 << Level Y方向为1 << Level

### 墨卡托切片规则

墨卡托投影将地球看作一个正方形及X方向和Y方向默认情况下都只有一个瓦片;

## 金字塔瓦片

- 根据切片规则生成零层的瓦片集;

```js
QuadtreeTile.createLevelZeroTiles = function (tilingScheme) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(tilingScheme)) {
    throw new DeveloperError("tilingScheme is required.");
  }
  //>>includeEnd('debug');
  const numberOfLevelZeroTilesX = tilingScheme.getNumberOfXTilesAtLevel(0);
  const numberOfLevelZeroTilesY = tilingScheme.getNumberOfYTilesAtLevel(0);
  const result = new Array(numberOfLevelZeroTilesX * numberOfLevelZeroTilesY);
  let index = 0;
  for (let y = 0; y < numberOfLevelZeroTilesY; ++y) {
    for (let x = 0; x < numberOfLevelZeroTilesX; ++x) {
      result[index++] = new QuadtreeTile({
        tilingScheme: tilingScheme,
        x: x,
        y: y,
        level: 0,
      });
    }
  }
  return result;
};
```

## 参考文献

- [quadtree-cheatseet](https://cesium.com/blog/2015/04/07/quadtree-cheatseet/)
