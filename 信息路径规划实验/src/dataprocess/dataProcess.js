import { ObstacleMap } from '../assets/ObstacleMap';

class POI {
  constructor(x, y, visited = false, entropy = 0) {
    this.x = x;
    this.y = y;
    this.visited = visited;
    this.entropy = entropy;
  }
}

class Map2D {
  constructor(maxX, maxY) {
    this.maxX = maxX;
    this.maxY = maxY;
    this.totalGrids = maxX * maxY;
    this.initMap();
  }

  initMap() {
    this.ObSet = new Set(ObstacleMap.map(item => item.toString()));
  }

  hasObstacle(poi1, poi2) {
    let touched
    if (poi1 instanceof Array && poi2 instanceof Array) {
      touched = this.GetTouchedPosBetweenTwoPoints(poi1, poi2);
    } else {
      touched = this.GetTouchedPosBetweenTwoPoints([poi1.x, poi1.y], [poi2.x, poi2.y]);
    }
    return touched.map(item => item.toString()).some(item => this.ObSet.has(item));
  }

  /**
   * 计算目标位置到原点所经过的格子
   * @param target
   * @returns {[]}
   * @constructor
   */
  GetTouchedPosBetweenOrigin2Target(target) {
    let touched = [];
    let steep = Math.abs(target[1]) > Math.abs(target[0]);
    let x = steep ? target[1] : target[0];
    let y = steep ? target[0] : target[1];

    //斜率
    let tangent = y / x;

    let delta = x > 0 ? 0.5 : -0.5;

    for (let i = 1; i < 2 * Math.abs(x); i++) {
      let tempX = i * delta;
      let tempY = tangent * tempX;
      let isOnEdge = Math.abs(tempY - Math.floor(tempY)) === 0.5;

      //偶数 格子内部判断
      if ((i & 1) === 0) {
        //在边缘,则上下两个格子都满足条件
        if (isOnEdge) {
          touched.push([Math.round(tempX), Math.ceil(tempY)]);
          touched.push([Math.round(tempX), Math.floor(tempY)]);
        }
        //不在边缘就所处格子满足条件
        else {
          touched.push([Math.round(tempX), Math.round(tempY)]);
        }
      }

      //奇数 格子边缘判断
      else {
        //在格子交点处,不视为阻挡,忽略
        if (isOnEdge) {
          continue;
        }
        //否则左右两个格子满足
        else {
          touched.push([Math.ceil(tempX), Math.round(tempY)]);
          touched.push([Math.floor(tempX), Math.round(tempY)]);
        }
      }
    }

    if (steep) {
      //镜像翻转 交换 X Y
      for (let i = 0; i < touched.length; i++) {
        let v = touched[i];
        v[0] = v[0] ^ v[1];
        v[1] = v[0] ^ v[1];
        v[0] = v[0] ^ v[1];

        touched[i] = v;
      }
    }

    return touched;
  }

  /**
   * 计算两点间经过的格子
   * @param from
   * @param to
   * @returns {*[][]}
   * @constructor
   */
  GetTouchedPosBetweenTwoPoints(from, to) {
    let touchedGrids = this.GetTouchedPosBetweenOrigin2Target([to[0] - from[0], to[1] - from[1]]);
    return touchedGrids.map(item => {
      return [
        item[0] + from[0],
        item[1] + from[1]
      ]
    });
  }

  /**
   * 根据已知点的熵得到未知点的熵
   * @param source  源坐标
   * @param sourceValue  源熵
   * @param target  目的坐标
   * @param targetValue  目的熵
   * @param range   数据范围
   * @returns {*}
   */
  getEntropyFromKnown(source, sourceValue, target, range) {
    if (!(source instanceof Array) && !(target instanceof Array)) {
      source = [source.x, source.y];
      target = [target.x, target.y];
    }
    if (this.hasObstacle(source, target)) return range[0];

    // 距离函数
    function dist(source, target) {
      return Math.sqrt(Math.pow(source[0] - target[0], 2) + Math.pow(source[1] - target[1], 2));
    }

    let dataRange = range[1] - range[0];
    function getValue(sourceValue, dist) {
      if (dist === 0) return sourceValue;
      return range[0] + dataRange / (dist + 0.2) + (Math.random() - 0.6) * 10 / dist;
    }

    return getValue(sourceValue, dist(source, target));
  }

  dataFuse(dataList) {
    return Math.max(...dataList);
  }
}

export {
  Map2D
}



