# path-warp-paper.js

Warp a path to fit other boundary paths. Paper.js implementation.

## Installation

  `npm install path-warp-paper`

## Usage
   The feature is registered as an extension to `Path` and `CompoundPath` in Paper.js. 
   Paper.js is built for canvas rendering, but it can also be used as a calculation library unattached to canvas (export elements to SVG).

   ```
   import paper from 'paper'
   import { PathWarp } from 'path-warp-paper';

   paper.setup(/* pass canvas element id to render on canvas */);

   const top = new paper.Path(...);
   const bottom = new paper.Path(...);
   const target = new paper.Path(...);
   target.projectBetween(top, bottom);

   // This is unnecessary for canvas render
   cosnt svgPath = target.exportSVG();
   ```

![Demo](/demo-screen.jpg?raw=true "Demo screen")