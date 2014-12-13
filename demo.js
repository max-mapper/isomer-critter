var ic = require('./')

var url = require('url')
var parsed = url.parse(window.location.href, true)
var image = parsed.query.url || 'mario.png'
ic(image)

var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')