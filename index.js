var Convert = require('voxel-critter/lib/convert.js')
var ndarray = require('ndarray')
var fill = require("ndarray-fill")
var Isomer = require('isomer')

var Shape = Isomer.Shape
var Point = Isomer.Point
var Color = Isomer.Color

window.Isomer = Isomer

module.exports = function(src) {
  var convert = new Convert()
  convert.readImage(src, function(err, hash) {
    if (err) throw err
    var data = convert.toVoxels(hash)
    console.log(data)

    var l = data.bounds[0]
    var h = data.bounds[1]
    var d = [ h[0]-l[0], h[1]-l[1], h[2]-l[2] ]
    var len = (d[0] + 8) * (d[1] + 8) * (d[2] + 8)
    var voxels = ndarray(new Int32Array(len), [d[0] + 4, d[1] + 4, d[2] + 4])

    function generateVoxels(x, y, z) {
      var offset = [x + l[0], y + l[1], z + l[2]]
      var val = data.voxels[offset.join('|')]
      if (val === 0) val = 1 // green voxels are stored as zeroes by voxelbuilder
      return val || 0
    }

    var interior = voxels.lo(1, 1, 1).hi(d[0] + 4, d[1] + 4, d[2] + 4)
    fill(interior, generateVoxels)

    var canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    var iso = new Isomer(canvas)
    var sc = 0.2
    var shapes = []
    var s = interior.shape
    var delay = 0
    var interval = 10
    for (var i = s[0]; i > 0; i--) {
      for (var j = 0; j < s[1]; j++) {
        for (var k = 0; k < s[2]; k++) {
          var val = interior.get(i,j,k)
          if (val) {
            var rgb = data.colors[val].map(function(v) { return scale(v, 0, 1, 0, 255) })
            var shp = Shape.Prism(new Point(i * sc, (s[2] - k) * sc, j * sc), sc, sc, sc)
            var cj = (function(sh, co) {
              return function() {
                iso.add(sh, co)
              }
            })(shp, new Color(rgb[0], rgb[1], rgb[2]))
            setTimeout(cj, delay)
            delay += interval
          }
        }
      }
    }
  })
}


function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}
