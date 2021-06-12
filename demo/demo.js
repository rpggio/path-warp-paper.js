import * as opentype from 'opentype.js';
import paperGlobal from 'paper';

import PathWarp from '../src/index';
import roboto from './Roboto-500.ttf';

function renderPaperPath(paper, pathData) {
  new PathWarp().register(paper);

  const topPath = new paper.Path({
    pathData: 'M14,96.19924l260,-90',
    strokeColor: 'lightgray',
  });
  const bottomPath = new paper.Path({
    pathData: 'M44,176.19924c120,50 190,70 220,10',
    strokeColor: 'lightgray',
  });

  const targetPath = new paper.CompoundPath({
    pathData,
    fillColor: 'lightblue',
  });
  targetPath.warpBetween(topPath, bottomPath);
  return { targetPath, topPath, bottomPath };
}

function renderSvg(pathData) {
  const paper = new paperGlobal.PaperScope();
  paper.setup();

  const { targetPath, topPath, bottomPath } = renderPaperPath(paper, pathData);

  const svg = document.getElementById('svgElement');
  svg.appendChild(topPath.exportSVG());
  svg.appendChild(bottomPath.exportSVG());
  svg.appendChild(targetPath.exportSVG());
}

function renderCanvas(pathData) {
  const paper = new paperGlobal.PaperScope();
  paper.setup('canvasElement');
  renderPaperPath(paper, pathData);
}

opentype.load(roboto, (err, font) => {
  if (err) {
    throw err;
  } else {
    const pathData = font.getPath('WARP', 0, 0, 64).toPathData();
    renderSvg(pathData);
    renderCanvas(pathData);
  }
});
