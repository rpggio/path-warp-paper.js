import assert from 'assert';
import paper from 'paper';

import PathWarp from '../src/index';

function roundHundredths(value){
  return Math.round(value * 100) / 100;
}

function getPathPoints(path){
  return path.segments.map(s => 
      s.point.toArray().map(v => 
        roundHundredths(v)));
}

describe('path.warpBetween', function(){
  paper.setup();
  new PathWarp(paper);

  const top = new paper.Path([[0, 10], [100, 50]]);     // midpoint: [50, 30]
  const bottom = new paper.Path([[0, 20], [80, 100]]);  // midpoint: [40, 60]
  const letterY = new paper.Path([[0, 0], [5, 5], [5, 10], [5, 5], [10, 0]]);  
  letterY.warpBetween(top, bottom);
  const points = getPathPoints(letterY);

  it('should scale path points between top and bottom', function(){
    assert.deepEqual(points, [[0, 10], [45, 45], [40, 60], [45, 45], [100, 50]]);
  });

  it('should not affect top or bottom path', function(){
    assert.deepEqual(getPathPoints(top), [[0, 10], [100, 50]]);
    assert.deepEqual(getPathPoints(bottom), [[0, 20], [80, 100]]);
  });

  it('should not leave other artifacts in the project', function(){
    // Three paths + one layer
    assert.equal(paper.project.getItems({recursive: true}).length, 4);
  });

});