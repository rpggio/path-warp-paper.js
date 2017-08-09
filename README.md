# path-warp-paper.js [![Build Status](https://travis-ci.org/ryascl/path-warp-paper.js.svg?branch=master)](https://travis-ci.org/ryascl/path-warp-paper.js)

Warp a path to fit other boundary paths. [Paper.js](paperjs.org) implementation.

## Installation

  `npm install path-warp-paper`

## Usage
   The feature is registered as an extension to `Path` and `CompoundPath` in Paper.js. 
   Paper.js is built for canvas rendering, but it can also be used as a calculation library unattached to canvas (export elements to SVG).

### Canvas render
   ```
   import paper from 'paper'
   import PathWarp from 'path-warp-paper';

   paper.setup('canvasId');
   new PathWarp(paper);

   const top = new paper.Path(...);
   const bottom = new paper.Path(...);
   const target = new paper.Path(...);
   target.warpBetween(top, bottom);
   ```

### SVG render
   ```
   paper.setup();
   new PathWarp(paper);

   const top = new paper.Path(...);
   const bottom = new paper.Path(...);
   const target = new paper.Path(...);
   target.warpBetween(top, bottom);

   cosnt svgPath = target.exportSVG();
   document.getElementById('svgId').appendChild(svgPath);
   ```

## Screenshot

From demo page:

`npm run demo`

![Demo](https://github.com/ryascl/path-warp-paper.js/raw/master/demo-screen.JPG?raw=true "Demo screen")
