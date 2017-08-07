import * as opentype from 'opentype.js'
import paper from 'paper'

import { PathWarp } from '../src/index';

var draw = SVG('drawing').size(600, 600);
var rect = draw.rect(10, 10).attr({ fill: 'gray' });

opentype.load('./Roboto-500.ttf', (err, font) => {
  if (err) {
    throw err; 
  } else {
    const pathString = font.getPath("RON", 0, 0, 128).toPathData();
    
    renderPoints(pathString);
  }
});

function renderPoints(pathString){

  const topPath = new paper.Path('M58 16 L6 34');
  topPath.reverse();
  const bottomPath = new paper.Path('M12 50 C36 60 50 64 56 52');
  const boundsGroup = new paper.Group([topPath, bottomPath]);
  boundsGroup.position = bottomPath.position.add(new paper.Point(200, 200));
  boundsGroup.scale(5);

  let renderGroup;

  const render = (renderParam) => {
    renderGroup && renderGroup.remove();
    renderGroup = draw.group();

    topPath.rotate(renderParam);

    var group1 = renderGroup.group().move(100, 200);
    var group2 = renderGroup.group().move(200, 200);

    renderGroup.path(topPath.getPathData()).fill('none').stroke('gold');
    renderGroup.path(bottomPath.getPathData()).fill('none').stroke('gold');

    const textPath = new paper.CompoundPath({pathData: pathString });
    
    const projected = fontWarp.projectPathBetween(textPath, topPath, bottomPath);
    renderGroup.path(projected.getPathData())
      .attr({
        fill: 'indigo',
        stroke: 'indigo',
        'fill-opacity': 0.5
      });

  }

  let i = 0;
  let iter = 0;
  let incr = 0.5;

  console.time('run');

  const cycle = () => {
    render(incr);
    i += incr;
    if(Math.abs(i) >= 20) {
      incr = -incr;
    }
    if(iter++ < 200) {
      setTimeout(cycle, 10);
    } else {
      console.timeEnd('run');
    }
  }

  cycle();

}
