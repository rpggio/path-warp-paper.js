'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PathWarp = function () {

  /**
  * Creates PathWarp instance.
  * @param {paper.PaperScope} paper - Paper paper.
  *   To run without canvas element (such as for SVG rendering), just
  *   call `paper.setup()` before calling this.
  */
  function PathWarp(paper) {
    _classCallCheck(this, PathWarp);

    if (!paper) {
      throw new Error('PathWarp requires PaperScope');
    }

    this.paper = paper;

    this.paper.Point.inject({
      toArray: function toArray() {
        return [this.x, this.y];
      }
    });

    var self = this;
    var warpBetwixt = function warpBetwixt(topPath, bottomPath, options) {
      return self.warpPathBetween(this, topPath, bottomPath, options);
    };

    this.paper.Path.inject({
      projectBetween: warpBetwixt,
      smoothCurves: function smoothCurves(path, tol) {
        return PathWarp.smoothCurves(path, tol);
      }
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
  */


  _createClass(PathWarp, [{
    key: 'warpPathBetween',
    value: function warpPathBetween(targetPath, topPath, bottomPath, options) {
      var _this = this;

      var _ref = options || {},
          flattenTolerance = _ref.flattenTolerance,
          smoothToleranceDeg = _ref.smoothToleranceDeg;

      if (!flattenTolerance) {
        flattenTolerance = 0.2;
      }

      var projection = PathWarp.dualBoundsPathProjection(topPath, bottomPath);
      var sourceBounds = targetPath.bounds;

      var transform = function transform(path) {
        path.flatten(flattenTolerance);
        var sourcePoints = path.segments.map(function (s) {
          return s.point;
        });

        var projectedPoints = sourcePoints.map(function (point) {
          var relative = point.subtract(sourceBounds.topLeft);
          var unitPoint = new _this.paper.Point(relative.x / sourceBounds.width, relative.y / sourceBounds.height);
          return projection(unitPoint);
        });

        path.removeSegments();
        path.addSegments(projectedPoints);
      };

      if (targetPath.className === 'CompoundPath') {
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

  }], [{
    key: 'dualBoundsPathProjection',
    value: function dualBoundsPathProjection(topPath, bottomPath) {
      var topPathLength = topPath.length;
      var bottomPathLength = bottomPath.length;
      return function (unitPoint) {
        var topPoint = topPath.getPointAt(unitPoint.x * topPathLength);
        var bottomPoint = bottomPath.getPointAt(unitPoint.x * bottomPathLength);
        if (topPoint == null || bottomPoint == null) {
          console.warn("could not get projected point for unit point " + unitPoint);
          return topPoint;
        } else {
          return topPoint.add(bottomPoint.subtract(topPoint).multiply(unitPoint.y));
        }
      };
    }

    /**
    * Smoothes any vertexes along curves that are 'nearly' smooth.
    * @param {paper.Path} path - Path to be modified.
    * @param {number} toleranceDeg - Vertexes with angle difference less than 
    *   this are considered smoothable.
    */

  }, {
    key: 'smoothCurves',
    value: function smoothCurves(path) {
      var toleranceDeg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;

      var prevAngle = path.lastCurve.getTangentAt(0.5).angle;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = path.segments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var segment = _step.value;

          var tangent = segment.curve.getTangentAt(0.5);
          if (tangent == null) {
            continue;
          }
          var angle = tangent.angle;

          var angleDiff = Math.abs(angle - prevAngle);
          if (angleDiff > 0.1 && angleDiff < toleranceDeg) {
            segment.smooth({ type: 'catmull-rom' });
          }

          prevAngle = angle;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);

  return PathWarp;
}();

exports.PathWarp = PathWarp;