/* eslint-env node, mocha */
process.env.NODE_ENV = 'test';

// npm 
const chai = require('chai');

// local
const mp = require('../docs/js/mp.js');
const decomposition = require('../docs/js/model_decomposition.js');
const ImageUtils = require('../docs/js/imageutils.js');

// Bind for test
decomposition.DecomposeModel.mp = mp;

const ndarray = require('ndarray');
const ndops = require('ndarray-ops');
const getPixels = require('get-pixels');

/* === Setup === */
const expect = chai.expect;
const assert = chai.assert;

describe('Decomposition Model Unit Tests', function() {

	// First, prepare the mp
	mp.p5_inst.setup();
	mp.clears();

	it('should correctly convert an image to strokes', function(done) {
		
		getPixels('./test/assets/smallhap.png', function(err, img) {
			assert.isNull(err);
			let tensor = decomposition.DecomposeModel.imageToTensor(img);
			decomposition.DecomposeModel.imageToStrokes(tensor);
			done();
			
		});

	});

});

describe('ImageUtils Unit Tests', function() {

	it('should correctly median filter an image ndarray', function(done) {

		getPixels('./test/assets/hap.png', function(err, img) {
			assert.isNull(err);

			let arr = new Uint8ClampedArray(5 * 5 * 4);
			arr.fill(127);
			let tensor = ndarray(arr, [5, 5, 4]);
			tensor.set(1, 1, 0, 50);
			tensor.set(1, 1, 1, 50);
			tensor.set(1, 1, 2, 50);

			let targetArr = new Uint8ClampedArray(tensor.data.length);
			targetArr.fill(255);
			let target = ndarray(targetArr, tensor.shape);

			ImageUtils.medianFilter(target, tensor, 3, 3);

			// Prepare the array
			let correctArr = new Uint8ClampedArray(tensor.data.length);
			correctArr.fill(127);
			let correct = ndarray(correctArr, tensor.shape);
			let x;
			let y;
			for (x = 0; x < tensor.shape[0]; x++) {
				for (y = 0; y < tensor.shape[1]; y++) {
					correct.set(x, y, 3, 255);
				}
			}

			// See that the point in the middle has been smoothed out
			assert.isTrue(ndops.equals(target, correct));
			done();
		});

	});

	it('should reject median filters of even dimension', function(done) {

		getPixels('./test/assets/hap.png', function(err, img) {
			assert.isNull(err);

			let tensor = decomposition.DecomposeModel.imageToTensor(img);
			let target = ndarray(new Uint8ClampedArray(tensor.data.length), tensor.shape);
			let runTest = function() {
				ImageUtils.medianFilter(target, tensor, 4, 3);
			}
			assert.throws(runTest, /odd dimensions/);
			done();
		});

	});
});
