Quadtree
========

    QuadTree = require "./lib/quadtree"

    module.exports = (I={}) ->
      I.x ?= 0
      I.y ?= 0
      I.width ?= 1
      I.height ?= 1

      new QuadTree(I, true)
