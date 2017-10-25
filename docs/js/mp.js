// const ndarray = require('ndarray')
// const ndpack = require('ndarray-pack')
// const p5 = require('p5');

/* DEFINE ARBITRARIlY-DETERMINED GLOBAL VARIABLES */

// Amount of rows to pre-allocate for State Tensor.
const ROWS = 64;

// Definition of data stored in MPState state array (tensor)
const DataIndices = {
  startX: 0,
  startY: 1,
  endX: 2,
  endY: 3,
  width: 4,
  colorR: 5,
  colorG: 6,
  colorB: 7
}

/* DEFINE STATE */


var MPState = {
  // This is something like an arraylist.
  // Each row should store a line segment and auxillary data.
  // Since we are using this form of data storage,
  // Using OOP paradigms are too costly for consistent use.
  array: ndarray(new Float64Array(8 * ROWS), [ROWS, 8]),

  // The index sits at the next-written position.
  // We display all vectors up to, but not including the position.
  strokeIndex: 0,

  // This index sits at the next available empty position.
  // If we overwrite anything, we should set this to strokeIndex.
  // Otherwise, this serves as an upper limit on 
  dataIndex: 0,

  /*
    Add a stroke to the state.
    p: p5 instance
    lineSize: Number - describes width
    color: p5.Color - describes color
  */
  addStroke(p, lineSize, color) {
    // We must use the interface provided by ndarray :(
    // Thus, this code is unavoidably a bit messy...
    this.array.set(this.strokeIndex, DataIndices.startX, p.pmouseX);
    this.array.set(this.strokeIndex, DataIndices.startY, p.pmouseY);
    this.array.set(this.strokeIndex, DataIndices.endX, p.mouseX);
    this.array.set(this.strokeIndex, DataIndices.endY, p.mouseY);
    this.array.set(this.strokeIndex, DataIndices.width, lineSize);
    this.array.set(this.strokeIndex, DataIndices.colorR, color.levels[0]);
    this.array.set(this.strokeIndex, DataIndices.colorG, color.levels[1]);
    this.array.set(this.strokeIndex, DataIndices.colorB, color.levels[2]);
    this.strokeIndex++;
    this.dataIndex++;
  },

  /**
    Get current stroke.
  */
  getCurrentStroke() {
    if (this.strokeIndex > 0)
      return this.array[this.strokeIndex - 1];
    else
      return null;
  },

  /**
    Get all visible strokes.
  */
  getVisibleStrokes() {
    return this.array.hi(this.strokeIndex)
  },

  /**
    Step stroke index backward.
  */
  back() {
    if (this.strokeIndex > 0)
      this.strokeIndex--;
  },

}


/**
  Function definition for p5 object.
*/
function sketch_process(p) {

  var canvas = null;
  var color = null;
  var sizeSlider = null;
  var lineSize = 1;

  p.setup = function() {
    canvas = p.createCanvas(640, 480);
    lineSize = 5;
    color = p.color(0, 0, 0, 255);

    // For now, it's probably better to fix opacity and width.
    // They aren't anywhere in our SDS.
    sizeSlider = p.createSlider(0, 10, lineSize);

    canvas.parent("canvas-holder")
    p.predraw();
  }

  // Additional function for non-interfering setup
  p.predraw = function() {
    p.strokeWeight(1);
    p.rect(1, 0, 638, 479);
    p.strokeWeight(lineSize);
  }

  p.draw = function() {

  }

  p.mouseDragged = function() {
    lineSize = sizeSlider.value();
    p.strokeWeight(lineSize);
    p.stroke(color);
    p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
    MPState.addStroke(p, lineSize, color);
  }

  p.resetCanvas = function() {
    p.clear();
    p.predraw();
    // Don't call setup since we'll proliferate sliders, etc.
  }

  p.getSize = function() {
    return lineSize;
  }
}

// Instantiate the p5js instance.
var p5_inst = new p5(sketch_process);

/* DEFINE BUTTON CALLBACKS */
function seekBackward() {
  MPState.back();
  strokes = MPState.getVisibleStrokes();
  p5_inst.resetCanvas();
  for (var i=0; i < strokes.shape[0]; i++) {

    // Partially completed function - clean up code
    function accessStroke(index) {
      return strokes.get(i, index)
    }

    stroke = strokes;

    p5_inst.stroke(accessStroke(DataIndices.colorR),
                   accessStroke(DataIndices.colorG),
                   accessStroke(DataIndices.colorB));
    p5_inst.line(accessStroke(DataIndices.startX),
                 accessStroke(DataIndices.startY),
                 accessStroke(DataIndices.endX),
                 accessStroke(DataIndices.endY));
  }
}
