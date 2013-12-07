Quadtree
========

Wrapping up a patched version of:

https://github.com/jsmarkus/ExamplesByMesh/blob/1b42ccdd4b89e15231ca0eaaf690ac236a64306c/JavaScript/QuadTree/src/QuadTree.js

    QuadTree = require "./lib/quadtree"

    module.exports = (I={}) ->
      I.x ?= 0
      I.y ?= 0
      I.width ?= 1
      I.height ?= 1

      new QuadTree(I, true, I.maxDepth, I.maxChildren)
