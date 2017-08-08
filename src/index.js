
export default class PathWarp {

  /**
  * Creates PathWarp instance.
  * @param {paper.PaperScope} paper - Paper paper.
  *   To run without canvas element (such as for SVG rendering), just
  *   call `paper.setup()` before calling this.
  */
  constructor(paper){

    if(!paper){
      throw new Error('PathWarp requires PaperScope')
    }

    this.paper = paper;

    this.paper.Point.inject({
      toArray: function() {
        return [this.x, this.y];
      }
    });

    const self = this;
    const warpBetwixt = function (topPath, bottomPath, options) {
      return self.warpPathBetween(this, topPath, bottomPath, options);
    }

    this.paper.Path.inject({
      projectBetween: warpBetwixt,
      smoothCurves: (path, tol) => PathWarp.smoothCurves(path, tol)
    });

    this.paper.CompoundPath.inject({
      projectBetween: warpBetwixt
    });

  }

  /**
  * Warp source path between upper and lower
  *   bounding paths. This will mutate the path.
  * @param {paper.CompoundPath|paper.CompoundPath} targetPath - Path to warp. It will be
  *  treated as having rectangular bounds.
  * @param {paper.Path} topPath - Top boundary path.
  * @param {paper.Path} bottomPath - Bottom boundary path.
  * @param {object} options - Optional. properties: 
  *     flattenTolerance {number}: default 0.2
  *     toleranceDeg {number}: default 15
  */
  warpPathBetween(targetPath, topPath, bottomPath, options) {
    let { flattenTolerance, smoothToleranceDeg } = options || {};

    if(!flattenTolerance){
      flattenTolerance = 0.2;
    }

    const projection = PathWarp.dualBoundsPathProjection(topPath, bottomPath);
    const sourceBounds = targetPath.bounds;

    const transform = path => {
      path.flatten(flattenTolerance);
      const sourcePoints = path.segments.map(s => s.point);

      const projectedPoints = sourcePoints.map(point => {
        const relative = point.subtract(sourceBounds.topLeft);
        const unitPoint = new this.paper.Point(
          relative.x / sourceBounds.width,
          relative.y / sourceBounds.height);
        return projection(unitPoint);
      });

      path.removeSegments();
      path.addSegments(projectedPoints);
    };

    if(targetPath.className === 'CompoundPath') {
      targetPath.children.map(transform);
    } else {
      transform(targetPath);
    }
  }

  /**
   * Create a function that will project rectangular points into an 
   *  area defined by upper and lower paths.
   * @param {paper.Path} Top bounds of projection area
   * @param {paper.Path} Bottom bounds of projection area
   * @return {function} Function of the form {paper.Point} => {paper.Point}
   *  The input point should be a unit-point with values between (0,0) and (1,1)
   */
  static dualBoundsPathProjection(topPath, bottomPath) {
      const topPathLength = topPath.length;
      const bottomPathLength = bottomPath.length;
      return unitPoint => {
          let topPoint = topPath.getPointAt(unitPoint.x * topPathLength);
          let bottomPoint = bottomPath.getPointAt(unitPoint.x * bottomPathLength);
          if (topPoint == null || bottomPoint == null) {
              console.warn("could not get projected point for unit point " + unitPoint);
              return topPoint;
          } else {
              return topPoint.add(bottomPoint.subtract(topPoint).multiply(unitPoint.y));
          }
      }
  }

  /**
  * Smoothes any vertexes along curves that are 'nearly' smooth.
  * @param {paper.Path} path - Path to be modified.
  * @param {number} toleranceDeg - Vertexes with angle difference less than 
  *   this are considered smoothable (default 15).
  */
  static smoothCurves(path, toleranceDeg = 15){
    let prevAngle = path.lastCurve.getTangentAt(0.5).angle;
    for(const segment of path.segments){
      const tangent = segment.curve.getTangentAt(0.5);
      if(tangent == null){
        continue;
      }
      const angle = tangent.angle;

      const angleDiff = Math.abs(angle - prevAngle);
      if(angleDiff > 0.1 && angleDiff < toleranceDeg){
        segment.smooth({type: 'catmull-rom'});
      }

      prevAngle = angle;
    }
  }

}
