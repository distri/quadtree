(function(pkg) {
  // Expose a require for our package so scripts can access our modules
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "mode": "100644",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "mode": "100644",
      "content": "quadtree\n========\n\nA humble quadtree\n",
      "type": "blob"
    },
    "lib/bounds.coffee.md": {
      "path": "lib/bounds.coffee.md",
      "mode": "100644",
      "content": "Bounds\n------\n\n    Bounds = (arg={}) ->\n      {x, y, width, height, __proto__} = arg\n      return arg if __proto__ is Bounds.prototype\n\n      x ?= 0\n      y ?= 0\n      width ?= 1\n      height ?= 1\n\n      x: x\n      y: y\n      width: width\n      height: height\n      __proto__: Bounds.prototype\n\n    Bounds.prototype =\n      midpoint: ->\n        Point(@x + @width, @y + @height).scale(0.5)\n\n      area: ->\n        @width * @height\n\n      contains: (point) ->\n        (@x <= point.x < @x + @width) and\n        (@y <= point.y < @y + @height)\n\n      left: ->\n        @x\n\n      right: ->\n        @x + @width\n\n      top: ->\n        @y\n\n      bottom: ->\n        @y + @height\n\n      overlap: (bounds) ->\n        @top() <= bounds.bottom() and @bottom() > bounds.top()\n        @left() <= bounds.right() and @right() > bounds.left()\n\n      toString: ->\n        \"Bounds({#{@x}, #{@y}}, {#{@width}, #{@height}})\"\n\n    module.exports = Bounds\n",
      "type": "blob"
    },
    "lib/quadtree.js": {
      "path": "lib/quadtree.js",
      "mode": "100644",
      "content": "/*\n  The MIT License\n\n\tCopyright (c) 2011 Mike Chambers\n\n\tPermission is hereby granted, free of charge, to any person obtaining a copy\n\tof this software and associated documentation files (the \"Software\"), to deal\n\tin the Software without restriction, including without limitation the rights\n\tto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n\tcopies of the Software, and to permit persons to whom the Software is\n\tfurnished to do so, subject to the following conditions:\n\n\tThe above copyright notice and this permission notice shall be included in\n\tall copies or substantial portions of the Software.\n\n\tTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\tIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\tFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\tAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n\tLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n\tOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n\tTHE SOFTWARE.\n*/\n\n\n/**\n* A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.\n* @module QuadTree\n* \n* Forked from: 1b42ccdd4b89e15231ca0eaaf690ac236a64306c\n**/\n\n/****************** QuadTree ****************/\n\n/**\n* QuadTree data structure.\n* @class QuadTree\n* @constructor\n* @param {Object} An object representing the bounds of the top level of the QuadTree. The object \n* should contain the following properties : x, y, width, height\n* @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds \n* (width / height)(false). Default value is false.\n* @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.\n* @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.\n**/\nfunction QuadTree(bounds, pointQuad, maxDepth, maxChildren)\n{\t\n\tvar node;\n\tif(pointQuad)\n\t{\n\t\t\n\t\tnode = new Node(bounds, 0, maxDepth, maxChildren);\n\t}\n\telse\n\t{\n\t\tnode = new BoundsNode(bounds, 0, maxDepth, maxChildren);\n\t}\n\t\n\tthis.root = node;\n}\n\n/**\n* The root node of the QuadTree which covers the entire area being segmented.\n* @property root\n* @type Node\n**/\nQuadTree.prototype.root = null;\n\n\n/**\n* Inserts an item into the QuadTree.\n* @method insert\n* @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y \n* properties that represents its position in 2D space.\n**/\nQuadTree.prototype.insert = function(item)\n{\n\tif(item instanceof Array)\n\t{\n\t\tvar len = item.length;\n\t\t\n\t\tfor(var i = 0; i < len; i++)\n\t\t{\n\t\t\tthis.root.insert(item[i]);\n\t\t}\n\t}\n\telse\n\t{\n\t\tthis.root.insert(item);\n\t}\n}\n\n/**\n* Clears all nodes and children from the QuadTree\n* @method clear\n**/\nQuadTree.prototype.clear = function()\n{\n\tthis.root.clear();\n}\n\n/**\n* Retrieves all items / points in the same node as the specified item / point. If the specified item\n* overlaps the bounds of a node, then all children in both nodes will be returned.\n* @method retrieve\n* @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape\n* with dimensions (x, y, width, height) properties.\n**/\nQuadTree.prototype.retrieve = function(item)\n{\n\t//get a copy of the array of items\n\tvar out = this.root.retrieve(item).slice(0);\n\t//return QuadTree._filterResults(out, {x:item.x, y:item.y, width:0, height:0});\n\treturn out;\n}\n\nQuadTree.prototype.retrieveInBounds = function (bounds)\n{\n\tvar treeResult = this.root.retrieveInBounds(bounds);\n\treturn QuadTree._filterResults(treeResult, bounds);\n}\n\nQuadTree._filterResults = function(treeResult, bounds)\n{\n\tvar filteredResult = [];\n\n\tif(this.root instanceof BoundsNode)\n\t{\n\t\tfor (var i=0; i < treeResult.length; i++)\n\t\t{\n\t\t\tvar node = treeResult[i];\n\t\t\tif (QuadTree._isBoundOverlappingBound(node, bounds))\n\t\t\t{\n\t\t\t\tfilteredResult.push(node);\n\t\t\t}\n\t\t}\n\t}\n\telse\n\t{\n    for (var i=0; i < treeResult.length; i++) {\n\t\t\tvar node = treeResult[i];\n\n      if(node && QuadTree._isPointInsideBounds(node, bounds)) {\n\t\t\t\tfilteredResult.push(node);\n\t\t\t}\n\t\t}\n\t}\n\n\treturn filteredResult;\n}\n\nQuadTree._isPointInsideBounds = function (point, bounds)\n{\n\treturn (\n\t\t(point.x >= bounds.x) &&\n\t\t(point.x < bounds.x + bounds.width) &&\n\t\t(point.y >= bounds.y) &&\n\t\t(point.y < bounds.y + bounds.height)\n\t);\n}\n\n\nQuadTree._isBoundOverlappingBound = function (b1, b2)\n{\n\treturn !(\n    b1.x > (b2.x + b2.width)  || \n    b2.x > (b1.x + b1.width)  || \n    b1.y > (b2.y + b2.height) ||\n    b2.y > (b1.y + b1.height)\n  );\n}\n\n/************** Node ********************/\n\n\nfunction Node(bounds, depth, maxDepth, maxChildren)\n{\n\tthis._bounds = bounds;\n\tthis.children = [];\n\tthis.nodes = [];\n\t\n\tif(maxChildren)\n\t{\n\t\tthis._maxChildren = maxChildren;\n\t\t\n\t}\n\t\n\tif(maxDepth)\n\t{\n\t\tthis._maxDepth = maxDepth;\n\t}\n\t\n\tif(depth)\n\t{\n\t\tthis._depth = depth;\n\t}\n}\n\n//subnodes\nNode.prototype.nodes = null;\nNode.prototype._classConstructor = Node;\n\n//children contained directly in the node\nNode.prototype.children = null;\nNode.prototype._bounds = null;\n\n//read only\nNode.prototype._depth = 0;\n\nNode.prototype._maxChildren = 4;\nNode.prototype._maxDepth = 4;\n\nNode.TOP_LEFT = 0;\nNode.TOP_RIGHT = 1;\nNode.BOTTOM_LEFT = 2;\nNode.BOTTOM_RIGHT = 3;\n\n\nNode.prototype.insert = function(item)\n{\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\t\n\t\tthis.nodes[index].insert(item);\n\t\t\n\t\treturn;\n\t}\n\n\tthis.children.push(item);\n\n\tvar len = this.children.length;\n\tif(!(this._depth >= this._maxDepth) && \n\t\tlen > this._maxChildren)\n\t{\n\t\tthis.subdivide();\n\t\t\n\t\tfor(var i = 0; i < len; i++)\n\t\t{\n\t\t\tthis.insert(this.children[i]);\n\t\t}\n\t\t\n\t\tthis.children.length = 0;\n\t}\n}\n\nNode.prototype.retrieve = function(item)\n{\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\t\n\t\treturn this.nodes[index].retrieve(item);\n\t}\n\t\n\treturn this.children;\n}\n\nNode.prototype.retrieveInBounds = function(bounds)\n{\n\tvar result = [];\n\n\tif(this.collidesWith(bounds))\n\t{\n\t\tresult = result.concat(this._stuckChildren);\n\t\t\n\t\tif(this.children.length)\n\t\t{\n\t\t\tresult = result.concat(this.children);\n\t\t}\n\t\telse\n\t\t{\n\t\t\tif(this.nodes.length)\n\t\t\t{\n\t\t\t\tfor (var i = 0; i < this.nodes.length; i++)\n\t\t\t\t{\n\t\t\t\t\tresult = result.concat(this.nodes[i].retrieveInBounds(bounds));\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\treturn result;\n}\n\n\nNode.prototype.collidesWith = function (bounds)\n{\n\tvar b1 = this._bounds;\n\tvar b2 = bounds;\n\n\treturn !(\n    b1.x > (b2.x + b2.width)  || \n    b2.x > (b1.x + b1.width)  || \n    b1.y > (b2.y + b2.height) ||\n    b2.y > (b1.y + b1.height)\n  );\n}\n\nNode.prototype._findIndex = function(item)\n{\n\tvar b = this._bounds;\n\tvar left = (item.x > b.x + b.width / 2)? false : true;\n\tvar top = (item.y > b.y + b.height / 2)? false : true;\n\t\n\t//top left\n\tvar index = Node.TOP_LEFT;\n\tif(left)\n\t{\n\t\t//left side\n\t\tif(!top)\n\t\t{\n\t\t\t//bottom left\n\t\t\tindex = Node.BOTTOM_LEFT;\n\t\t}\n\t}\n\telse\n\t{\n\t\t//right side\n\t\tif(top)\n\t\t{\n\t\t\t//top right\n\t\t\tindex = Node.TOP_RIGHT;\n\t\t}\n\t\telse\n\t\t{\n\t\t\t//bottom right\n\t\t\tindex = Node.BOTTOM_RIGHT;\n\t\t}\n\t}\n\t\n\treturn index;\n}\n\n\nNode.prototype.subdivide = function()\n{\n\tvar depth = this._depth + 1;\n\t\n\tvar bx = this._bounds.x;\n\tvar by = this._bounds.y;\n\t\n\t//floor the values\n\tvar b_w_h = (this._bounds.width / 2)|0;\n\tvar b_h_h = (this._bounds.height / 2)|0;\n\tvar bx_b_w_h = bx + b_w_h;\n\tvar by_b_h_h = by + b_h_h;\n\n\t//top left\n\tthis.nodes[Node.TOP_LEFT] = new this._classConstructor({\n\t\tx:bx, \n\t\ty:by, \n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t}, \n\tdepth, this._maxDepth, this._maxChildren);\n\t\n\t//top right\n\tthis.nodes[Node.TOP_RIGHT] = new this._classConstructor({\n\t\tx:bx_b_w_h,\n\t\ty:by,\n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t},\n\tdepth, this._maxDepth, this._maxChildren);\n\t\n\t//bottom left\n\tthis.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({\n\t\tx:bx,\n\t\ty:by_b_h_h,\n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t},\n\tdepth, this._maxDepth, this._maxChildren);\n\t\n\t\n\t//bottom right\n\tthis.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({\n\t\tx:bx_b_w_h, \n\t\ty:by_b_h_h,\n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t},\n\tdepth, this._maxDepth, this._maxChildren);\t\n}\n\nNode.prototype.clear = function()\n{\t\n\tthis.children.length = 0;\n\t\n\tvar len = this.nodes.length;\n\tfor(var i = 0; i < len; i++)\n\t{\n\t\tthis.nodes[i].clear();\n\t}\n\t\n\tthis.nodes.length = 0;\n}\n\n\n/******************** BoundsQuadTree ****************/\n\nfunction BoundsNode(bounds, depth, maxChildren, maxDepth)\n{\n\tNode.call(this, bounds, depth, maxChildren, maxDepth);\n\tthis._stuckChildren = [];\n}\n\nBoundsNode.prototype = new Node();\nBoundsNode.prototype._classConstructor = BoundsNode;\nBoundsNode.prototype._stuckChildren = null;\n\n//we use this to collect and conctenate items being retrieved. This way\n//we dont have to continuously create new Array instances.\n//Note, when returned from QuadTree.retrieve, we then copy the array\nBoundsNode.prototype._out = [];\n\nBoundsNode.prototype.insert = function(item)\n{\t\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\tvar node = this.nodes[index];\n\n\t\t//todo: make _bounds bounds\n\t\tif(item.x >= node._bounds.x &&\n\t\t\titem.x + item.width <= node._bounds.x + node._bounds.width &&\n\t\t\titem.y >= node._bounds.y &&\n\t\t\titem.y + item.height <= node._bounds.y + node._bounds.height)\n\t\t{\n\t\t\tthis.nodes[index].insert(item);\n\t\t}\n\t\telse\n\t\t{\t\t\t\n\t\t\tthis._stuckChildren.push(item);\n\t\t}\n\t\t\n\t\treturn;\n\t}\n\n\tthis.children.push(item);\n\n\tvar len = this.children.length;\n\t\n\tif(!(this._depth >= this._maxDepth) && \n\t\tlen > this._maxChildren)\n\t{\n\t\tthis.subdivide();\n\t\t\n\t\tfor(var i = 0; i < len; i++)\n\t\t{\n\t\t\tthis.insert(this.children[i]);\n\t\t}\n\t\t\n\t\tthis.children.length = 0;\n\t}\n}\n\nBoundsNode.prototype.getChildren = function()\n{\n\treturn this.children.concat(this._stuckChildren);\n}\n\nBoundsNode.prototype.retrieve = function(item)\n{\n\tvar out = this._out;\n\tout.length = 0;\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\t\n\t\tout.push.apply(out, this.nodes[index].retrieve(item));\n\t}\n\t\n\tout.push.apply(out, this._stuckChildren);\n\tout.push.apply(out, this.children);\n\t\n\treturn out;\n}\n\nBoundsNode.prototype.clear = function()\n{\n\n\tthis._stuckChildren.length = 0;\n\t\n\t//array\n\tthis.children.length = 0;\n\t\n\tvar len = this.nodes.length;\n\t\n\tif(!len)\n\t{\n\t\treturn;\n\t}\n\t\n\tfor(var i = 0; i < len; i++)\n\t{\n\t\tthis.nodes[i].clear();\n\t}\n\t\n\t//array\n\tthis.nodes.length = 0;\t\n\t\n\t//we could call the super clear function but for now, im just going to inline it\n\t//call the hidden super.clear, and make sure its called with this = this instance\n\t//Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);\n}\n\nBoundsNode.prototype.getChildCount\n\nmodule.exports = QuadTree;\n",
      "type": "blob"
    },
    "main.coffee.md": {
      "path": "main.coffee.md",
      "mode": "100644",
      "content": "Quadtree\n========\n\nWrapping up a patched version of:\n\nhttps://github.com/jsmarkus/ExamplesByMesh/blob/1b42ccdd4b89e15231ca0eaaf690ac236a64306c/JavaScript/QuadTree/src/QuadTree.js\n\n    QuadTree = require \"./lib/quadtree\"\n\n    module.exports = (I={}) ->\n      I.x ?= 0\n      I.y ?= 0\n      I.width ?= 1\n      I.height ?= 1\n\n      new QuadTree(I, true, I.maxDepth, I.maxChildren)\n",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "mode": "100644",
      "content": "version: \"0.2.0\"\nremoteDependencies: [\n  \"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"\n]\n",
      "type": "blob"
    },
    "test/quadtree.coffee": {
      "path": "test/quadtree.coffee",
      "mode": "100644",
      "content": "QuadTree = require \"../main\"\nBounds = require \"../lib/bounds\"\n\nglobal.require = require\n\ndescribe \"QuadTree\", ->\n  it \"should store and query values\", ->\n    tree = QuadTree()\n\n    positions = [0...1000].map (i) ->\n      p = Point(i % 37, i % 43)\n      p.i = i\n\n      p\n\n    positions.forEach (position) ->\n      tree.insert position\n\n    positions.forEach (position, i) ->\n      results = tree.retrieve(position)\n\n      assert results.map((r)->r.i).indexOf(i) >= 0, \"results contain #{i}\"\n\n  it \"should retrieve in bounds\", ->\n    tree = QuadTree\n      width: 50\n      height: 50\n\n    positions = [0...1000].map (i) ->\n      p = Point(i % 37, i % 43)\n      p.i = i\n\n      p\n\n    positions.forEach (position) ->\n      tree.insert position\n\n    results = tree.retrieveInBounds\n      x: 0\n      y: 0\n      width: 37\n      height: 43\n\n    assert.equal results.length, 1000, \"results.length == 1000, actual: #{results.length}\"\n\n    results = tree.retrieveInBounds\n      x: 0\n      y: 0\n      width: 16\n      height: 43\n\n    results2 = tree.retrieveInBounds\n      x: 16\n      y: 0\n      width: 21\n      height: 43\n\n    console.log results.length, results2.length\n    total = results.length + results2.length\n\n    assert.equal total, 1000, \"Partition total should add up to 1000, actual: #{total}\"\n",
      "type": "blob"
    }
  },
  "distribution": {
    "lib/bounds": {
      "path": "lib/bounds",
      "content": "(function() {\n  var Bounds;\n\n  Bounds = function(arg) {\n    var height, width, x, y, __proto__;\n    if (arg == null) {\n      arg = {};\n    }\n    x = arg.x, y = arg.y, width = arg.width, height = arg.height, __proto__ = arg.__proto__;\n    if (__proto__ === Bounds.prototype) {\n      return arg;\n    }\n    if (x == null) {\n      x = 0;\n    }\n    if (y == null) {\n      y = 0;\n    }\n    if (width == null) {\n      width = 1;\n    }\n    if (height == null) {\n      height = 1;\n    }\n    return {\n      x: x,\n      y: y,\n      width: width,\n      height: height,\n      __proto__: Bounds.prototype\n    };\n  };\n\n  Bounds.prototype = {\n    midpoint: function() {\n      return Point(this.x + this.width, this.y + this.height).scale(0.5);\n    },\n    area: function() {\n      return this.width * this.height;\n    },\n    contains: function(point) {\n      var _ref, _ref1;\n      return ((this.x <= (_ref = point.x) && _ref < this.x + this.width)) && ((this.y <= (_ref1 = point.y) && _ref1 < this.y + this.height));\n    },\n    left: function() {\n      return this.x;\n    },\n    right: function() {\n      return this.x + this.width;\n    },\n    top: function() {\n      return this.y;\n    },\n    bottom: function() {\n      return this.y + this.height;\n    },\n    overlap: function(bounds) {\n      this.top() <= bounds.bottom() && this.bottom() > bounds.top();\n      return this.left() <= bounds.right() && this.right() > bounds.left();\n    },\n    toString: function() {\n      return \"Bounds({\" + this.x + \", \" + this.y + \"}, {\" + this.width + \", \" + this.height + \"})\";\n    }\n  };\n\n  module.exports = Bounds;\n\n}).call(this);\n\n//# sourceURL=lib/bounds.coffee",
      "type": "blob"
    },
    "lib/quadtree": {
      "path": "lib/quadtree",
      "content": "/*\n  The MIT License\n\n\tCopyright (c) 2011 Mike Chambers\n\n\tPermission is hereby granted, free of charge, to any person obtaining a copy\n\tof this software and associated documentation files (the \"Software\"), to deal\n\tin the Software without restriction, including without limitation the rights\n\tto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n\tcopies of the Software, and to permit persons to whom the Software is\n\tfurnished to do so, subject to the following conditions:\n\n\tThe above copyright notice and this permission notice shall be included in\n\tall copies or substantial portions of the Software.\n\n\tTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\tIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\tFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\tAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n\tLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n\tOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n\tTHE SOFTWARE.\n*/\n\n\n/**\n* A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.\n* @module QuadTree\n* \n* Forked from: 1b42ccdd4b89e15231ca0eaaf690ac236a64306c\n**/\n\n/****************** QuadTree ****************/\n\n/**\n* QuadTree data structure.\n* @class QuadTree\n* @constructor\n* @param {Object} An object representing the bounds of the top level of the QuadTree. The object \n* should contain the following properties : x, y, width, height\n* @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds \n* (width / height)(false). Default value is false.\n* @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.\n* @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.\n**/\nfunction QuadTree(bounds, pointQuad, maxDepth, maxChildren)\n{\t\n\tvar node;\n\tif(pointQuad)\n\t{\n\t\t\n\t\tnode = new Node(bounds, 0, maxDepth, maxChildren);\n\t}\n\telse\n\t{\n\t\tnode = new BoundsNode(bounds, 0, maxDepth, maxChildren);\n\t}\n\t\n\tthis.root = node;\n}\n\n/**\n* The root node of the QuadTree which covers the entire area being segmented.\n* @property root\n* @type Node\n**/\nQuadTree.prototype.root = null;\n\n\n/**\n* Inserts an item into the QuadTree.\n* @method insert\n* @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y \n* properties that represents its position in 2D space.\n**/\nQuadTree.prototype.insert = function(item)\n{\n\tif(item instanceof Array)\n\t{\n\t\tvar len = item.length;\n\t\t\n\t\tfor(var i = 0; i < len; i++)\n\t\t{\n\t\t\tthis.root.insert(item[i]);\n\t\t}\n\t}\n\telse\n\t{\n\t\tthis.root.insert(item);\n\t}\n}\n\n/**\n* Clears all nodes and children from the QuadTree\n* @method clear\n**/\nQuadTree.prototype.clear = function()\n{\n\tthis.root.clear();\n}\n\n/**\n* Retrieves all items / points in the same node as the specified item / point. If the specified item\n* overlaps the bounds of a node, then all children in both nodes will be returned.\n* @method retrieve\n* @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape\n* with dimensions (x, y, width, height) properties.\n**/\nQuadTree.prototype.retrieve = function(item)\n{\n\t//get a copy of the array of items\n\tvar out = this.root.retrieve(item).slice(0);\n\t//return QuadTree._filterResults(out, {x:item.x, y:item.y, width:0, height:0});\n\treturn out;\n}\n\nQuadTree.prototype.retrieveInBounds = function (bounds)\n{\n\tvar treeResult = this.root.retrieveInBounds(bounds);\n\treturn QuadTree._filterResults(treeResult, bounds);\n}\n\nQuadTree._filterResults = function(treeResult, bounds)\n{\n\tvar filteredResult = [];\n\n\tif(this.root instanceof BoundsNode)\n\t{\n\t\tfor (var i=0; i < treeResult.length; i++)\n\t\t{\n\t\t\tvar node = treeResult[i];\n\t\t\tif (QuadTree._isBoundOverlappingBound(node, bounds))\n\t\t\t{\n\t\t\t\tfilteredResult.push(node);\n\t\t\t}\n\t\t}\n\t}\n\telse\n\t{\n    for (var i=0; i < treeResult.length; i++) {\n\t\t\tvar node = treeResult[i];\n\n      if(node && QuadTree._isPointInsideBounds(node, bounds)) {\n\t\t\t\tfilteredResult.push(node);\n\t\t\t}\n\t\t}\n\t}\n\n\treturn filteredResult;\n}\n\nQuadTree._isPointInsideBounds = function (point, bounds)\n{\n\treturn (\n\t\t(point.x >= bounds.x) &&\n\t\t(point.x < bounds.x + bounds.width) &&\n\t\t(point.y >= bounds.y) &&\n\t\t(point.y < bounds.y + bounds.height)\n\t);\n}\n\n\nQuadTree._isBoundOverlappingBound = function (b1, b2)\n{\n\treturn !(\n    b1.x > (b2.x + b2.width)  || \n    b2.x > (b1.x + b1.width)  || \n    b1.y > (b2.y + b2.height) ||\n    b2.y > (b1.y + b1.height)\n  );\n}\n\n/************** Node ********************/\n\n\nfunction Node(bounds, depth, maxDepth, maxChildren)\n{\n\tthis._bounds = bounds;\n\tthis.children = [];\n\tthis.nodes = [];\n\t\n\tif(maxChildren)\n\t{\n\t\tthis._maxChildren = maxChildren;\n\t\t\n\t}\n\t\n\tif(maxDepth)\n\t{\n\t\tthis._maxDepth = maxDepth;\n\t}\n\t\n\tif(depth)\n\t{\n\t\tthis._depth = depth;\n\t}\n}\n\n//subnodes\nNode.prototype.nodes = null;\nNode.prototype._classConstructor = Node;\n\n//children contained directly in the node\nNode.prototype.children = null;\nNode.prototype._bounds = null;\n\n//read only\nNode.prototype._depth = 0;\n\nNode.prototype._maxChildren = 4;\nNode.prototype._maxDepth = 4;\n\nNode.TOP_LEFT = 0;\nNode.TOP_RIGHT = 1;\nNode.BOTTOM_LEFT = 2;\nNode.BOTTOM_RIGHT = 3;\n\n\nNode.prototype.insert = function(item)\n{\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\t\n\t\tthis.nodes[index].insert(item);\n\t\t\n\t\treturn;\n\t}\n\n\tthis.children.push(item);\n\n\tvar len = this.children.length;\n\tif(!(this._depth >= this._maxDepth) && \n\t\tlen > this._maxChildren)\n\t{\n\t\tthis.subdivide();\n\t\t\n\t\tfor(var i = 0; i < len; i++)\n\t\t{\n\t\t\tthis.insert(this.children[i]);\n\t\t}\n\t\t\n\t\tthis.children.length = 0;\n\t}\n}\n\nNode.prototype.retrieve = function(item)\n{\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\t\n\t\treturn this.nodes[index].retrieve(item);\n\t}\n\t\n\treturn this.children;\n}\n\nNode.prototype.retrieveInBounds = function(bounds)\n{\n\tvar result = [];\n\n\tif(this.collidesWith(bounds))\n\t{\n\t\tresult = result.concat(this._stuckChildren);\n\t\t\n\t\tif(this.children.length)\n\t\t{\n\t\t\tresult = result.concat(this.children);\n\t\t}\n\t\telse\n\t\t{\n\t\t\tif(this.nodes.length)\n\t\t\t{\n\t\t\t\tfor (var i = 0; i < this.nodes.length; i++)\n\t\t\t\t{\n\t\t\t\t\tresult = result.concat(this.nodes[i].retrieveInBounds(bounds));\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\treturn result;\n}\n\n\nNode.prototype.collidesWith = function (bounds)\n{\n\tvar b1 = this._bounds;\n\tvar b2 = bounds;\n\n\treturn !(\n    b1.x > (b2.x + b2.width)  || \n    b2.x > (b1.x + b1.width)  || \n    b1.y > (b2.y + b2.height) ||\n    b2.y > (b1.y + b1.height)\n  );\n}\n\nNode.prototype._findIndex = function(item)\n{\n\tvar b = this._bounds;\n\tvar left = (item.x > b.x + b.width / 2)? false : true;\n\tvar top = (item.y > b.y + b.height / 2)? false : true;\n\t\n\t//top left\n\tvar index = Node.TOP_LEFT;\n\tif(left)\n\t{\n\t\t//left side\n\t\tif(!top)\n\t\t{\n\t\t\t//bottom left\n\t\t\tindex = Node.BOTTOM_LEFT;\n\t\t}\n\t}\n\telse\n\t{\n\t\t//right side\n\t\tif(top)\n\t\t{\n\t\t\t//top right\n\t\t\tindex = Node.TOP_RIGHT;\n\t\t}\n\t\telse\n\t\t{\n\t\t\t//bottom right\n\t\t\tindex = Node.BOTTOM_RIGHT;\n\t\t}\n\t}\n\t\n\treturn index;\n}\n\n\nNode.prototype.subdivide = function()\n{\n\tvar depth = this._depth + 1;\n\t\n\tvar bx = this._bounds.x;\n\tvar by = this._bounds.y;\n\t\n\t//floor the values\n\tvar b_w_h = (this._bounds.width / 2)|0;\n\tvar b_h_h = (this._bounds.height / 2)|0;\n\tvar bx_b_w_h = bx + b_w_h;\n\tvar by_b_h_h = by + b_h_h;\n\n\t//top left\n\tthis.nodes[Node.TOP_LEFT] = new this._classConstructor({\n\t\tx:bx, \n\t\ty:by, \n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t}, \n\tdepth, this._maxDepth, this._maxChildren);\n\t\n\t//top right\n\tthis.nodes[Node.TOP_RIGHT] = new this._classConstructor({\n\t\tx:bx_b_w_h,\n\t\ty:by,\n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t},\n\tdepth, this._maxDepth, this._maxChildren);\n\t\n\t//bottom left\n\tthis.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({\n\t\tx:bx,\n\t\ty:by_b_h_h,\n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t},\n\tdepth, this._maxDepth, this._maxChildren);\n\t\n\t\n\t//bottom right\n\tthis.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({\n\t\tx:bx_b_w_h, \n\t\ty:by_b_h_h,\n\t\twidth:b_w_h, \n\t\theight:b_h_h\n\t},\n\tdepth, this._maxDepth, this._maxChildren);\t\n}\n\nNode.prototype.clear = function()\n{\t\n\tthis.children.length = 0;\n\t\n\tvar len = this.nodes.length;\n\tfor(var i = 0; i < len; i++)\n\t{\n\t\tthis.nodes[i].clear();\n\t}\n\t\n\tthis.nodes.length = 0;\n}\n\n\n/******************** BoundsQuadTree ****************/\n\nfunction BoundsNode(bounds, depth, maxChildren, maxDepth)\n{\n\tNode.call(this, bounds, depth, maxChildren, maxDepth);\n\tthis._stuckChildren = [];\n}\n\nBoundsNode.prototype = new Node();\nBoundsNode.prototype._classConstructor = BoundsNode;\nBoundsNode.prototype._stuckChildren = null;\n\n//we use this to collect and conctenate items being retrieved. This way\n//we dont have to continuously create new Array instances.\n//Note, when returned from QuadTree.retrieve, we then copy the array\nBoundsNode.prototype._out = [];\n\nBoundsNode.prototype.insert = function(item)\n{\t\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\tvar node = this.nodes[index];\n\n\t\t//todo: make _bounds bounds\n\t\tif(item.x >= node._bounds.x &&\n\t\t\titem.x + item.width <= node._bounds.x + node._bounds.width &&\n\t\t\titem.y >= node._bounds.y &&\n\t\t\titem.y + item.height <= node._bounds.y + node._bounds.height)\n\t\t{\n\t\t\tthis.nodes[index].insert(item);\n\t\t}\n\t\telse\n\t\t{\t\t\t\n\t\t\tthis._stuckChildren.push(item);\n\t\t}\n\t\t\n\t\treturn;\n\t}\n\n\tthis.children.push(item);\n\n\tvar len = this.children.length;\n\t\n\tif(!(this._depth >= this._maxDepth) && \n\t\tlen > this._maxChildren)\n\t{\n\t\tthis.subdivide();\n\t\t\n\t\tfor(var i = 0; i < len; i++)\n\t\t{\n\t\t\tthis.insert(this.children[i]);\n\t\t}\n\t\t\n\t\tthis.children.length = 0;\n\t}\n}\n\nBoundsNode.prototype.getChildren = function()\n{\n\treturn this.children.concat(this._stuckChildren);\n}\n\nBoundsNode.prototype.retrieve = function(item)\n{\n\tvar out = this._out;\n\tout.length = 0;\n\tif(this.nodes.length)\n\t{\n\t\tvar index = this._findIndex(item);\n\t\t\n\t\tout.push.apply(out, this.nodes[index].retrieve(item));\n\t}\n\t\n\tout.push.apply(out, this._stuckChildren);\n\tout.push.apply(out, this.children);\n\t\n\treturn out;\n}\n\nBoundsNode.prototype.clear = function()\n{\n\n\tthis._stuckChildren.length = 0;\n\t\n\t//array\n\tthis.children.length = 0;\n\t\n\tvar len = this.nodes.length;\n\t\n\tif(!len)\n\t{\n\t\treturn;\n\t}\n\t\n\tfor(var i = 0; i < len; i++)\n\t{\n\t\tthis.nodes[i].clear();\n\t}\n\t\n\t//array\n\tthis.nodes.length = 0;\t\n\t\n\t//we could call the super clear function but for now, im just going to inline it\n\t//call the hidden super.clear, and make sure its called with this = this instance\n\t//Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);\n}\n\nBoundsNode.prototype.getChildCount\n\nmodule.exports = QuadTree;\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var QuadTree;\n\n  QuadTree = require(\"./lib/quadtree\");\n\n  module.exports = function(I) {\n    if (I == null) {\n      I = {};\n    }\n    if (I.x == null) {\n      I.x = 0;\n    }\n    if (I.y == null) {\n      I.y = 0;\n    }\n    if (I.width == null) {\n      I.width = 1;\n    }\n    if (I.height == null) {\n      I.height = 1;\n    }\n    return new QuadTree(I, true, I.maxDepth, I.maxChildren);\n  };\n\n}).call(this);\n\n//# sourceURL=main.coffee",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.2.0\",\"remoteDependencies\":[\"http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js\"]};",
      "type": "blob"
    },
    "test/quadtree": {
      "path": "test/quadtree",
      "content": "(function() {\n  var Bounds, QuadTree;\n\n  QuadTree = require(\"../main\");\n\n  Bounds = require(\"../lib/bounds\");\n\n  global.require = require;\n\n  describe(\"QuadTree\", function() {\n    it(\"should store and query values\", function() {\n      var positions, tree, _i, _results;\n      tree = QuadTree();\n      positions = (function() {\n        _results = [];\n        for (_i = 0; _i < 1000; _i++){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function(i) {\n        var p;\n        p = Point(i % 37, i % 43);\n        p.i = i;\n        return p;\n      });\n      positions.forEach(function(position) {\n        return tree.insert(position);\n      });\n      return positions.forEach(function(position, i) {\n        var results;\n        results = tree.retrieve(position);\n        return assert(results.map(function(r) {\n          return r.i;\n        }).indexOf(i) >= 0, \"results contain \" + i);\n      });\n    });\n    return it(\"should retrieve in bounds\", function() {\n      var positions, results, results2, total, tree, _i, _results;\n      tree = QuadTree({\n        width: 50,\n        height: 50\n      });\n      positions = (function() {\n        _results = [];\n        for (_i = 0; _i < 1000; _i++){ _results.push(_i); }\n        return _results;\n      }).apply(this).map(function(i) {\n        var p;\n        p = Point(i % 37, i % 43);\n        p.i = i;\n        return p;\n      });\n      positions.forEach(function(position) {\n        return tree.insert(position);\n      });\n      results = tree.retrieveInBounds({\n        x: 0,\n        y: 0,\n        width: 37,\n        height: 43\n      });\n      assert.equal(results.length, 1000, \"results.length == 1000, actual: \" + results.length);\n      results = tree.retrieveInBounds({\n        x: 0,\n        y: 0,\n        width: 16,\n        height: 43\n      });\n      results2 = tree.retrieveInBounds({\n        x: 16,\n        y: 0,\n        width: 21,\n        height: 43\n      });\n      console.log(results.length, results2.length);\n      total = results.length + results2.length;\n      return assert.equal(total, 1000, \"Partition total should add up to 1000, actual: \" + total);\n    });\n  });\n\n}).call(this);\n\n//# sourceURL=test/quadtree.coffee",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://strd6.github.io/editor/"
  },
  "version": "0.2.0",
  "entryPoint": "main",
  "remoteDependencies": [
    "http://strd6.github.io/tempest/javascripts/envweb-v0.4.7.js"
  ],
  "repository": {
    "id": 14959438,
    "name": "quadtree",
    "full_name": "distri/quadtree",
    "owner": {
      "login": "distri",
      "id": 6005125,
      "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
      "gravatar_id": null,
      "url": "https://api.github.com/users/distri",
      "html_url": "https://github.com/distri",
      "followers_url": "https://api.github.com/users/distri/followers",
      "following_url": "https://api.github.com/users/distri/following{/other_user}",
      "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
      "organizations_url": "https://api.github.com/users/distri/orgs",
      "repos_url": "https://api.github.com/users/distri/repos",
      "events_url": "https://api.github.com/users/distri/events{/privacy}",
      "received_events_url": "https://api.github.com/users/distri/received_events",
      "type": "Organization",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/distri/quadtree",
    "description": "A humble quadtree",
    "fork": false,
    "url": "https://api.github.com/repos/distri/quadtree",
    "forks_url": "https://api.github.com/repos/distri/quadtree/forks",
    "keys_url": "https://api.github.com/repos/distri/quadtree/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/distri/quadtree/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/distri/quadtree/teams",
    "hooks_url": "https://api.github.com/repos/distri/quadtree/hooks",
    "issue_events_url": "https://api.github.com/repos/distri/quadtree/issues/events{/number}",
    "events_url": "https://api.github.com/repos/distri/quadtree/events",
    "assignees_url": "https://api.github.com/repos/distri/quadtree/assignees{/user}",
    "branches_url": "https://api.github.com/repos/distri/quadtree/branches{/branch}",
    "tags_url": "https://api.github.com/repos/distri/quadtree/tags",
    "blobs_url": "https://api.github.com/repos/distri/quadtree/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/distri/quadtree/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/distri/quadtree/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/distri/quadtree/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/distri/quadtree/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/distri/quadtree/languages",
    "stargazers_url": "https://api.github.com/repos/distri/quadtree/stargazers",
    "contributors_url": "https://api.github.com/repos/distri/quadtree/contributors",
    "subscribers_url": "https://api.github.com/repos/distri/quadtree/subscribers",
    "subscription_url": "https://api.github.com/repos/distri/quadtree/subscription",
    "commits_url": "https://api.github.com/repos/distri/quadtree/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/distri/quadtree/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/distri/quadtree/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/distri/quadtree/issues/comments/{number}",
    "contents_url": "https://api.github.com/repos/distri/quadtree/contents/{+path}",
    "compare_url": "https://api.github.com/repos/distri/quadtree/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/distri/quadtree/merges",
    "archive_url": "https://api.github.com/repos/distri/quadtree/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/distri/quadtree/downloads",
    "issues_url": "https://api.github.com/repos/distri/quadtree/issues{/number}",
    "pulls_url": "https://api.github.com/repos/distri/quadtree/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/distri/quadtree/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/distri/quadtree/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/distri/quadtree/labels{/name}",
    "releases_url": "https://api.github.com/repos/distri/quadtree/releases{/id}",
    "created_at": "2013-12-05T16:41:18Z",
    "updated_at": "2013-12-05T23:04:29Z",
    "pushed_at": "2013-12-05T23:04:29Z",
    "git_url": "git://github.com/distri/quadtree.git",
    "ssh_url": "git@github.com:distri/quadtree.git",
    "clone_url": "https://github.com/distri/quadtree.git",
    "svn_url": "https://github.com/distri/quadtree",
    "homepage": null,
    "size": 412,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "JavaScript",
    "has_issues": true,
    "has_downloads": true,
    "has_wiki": true,
    "forks_count": 0,
    "mirror_url": null,
    "open_issues_count": 0,
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "master",
    "master_branch": "master",
    "permissions": {
      "admin": true,
      "push": true,
      "pull": true
    },
    "organization": {
      "login": "distri",
      "id": 6005125,
      "avatar_url": "https://identicons.github.com/f90c81ffc1498e260c820082f2e7ca5f.png",
      "gravatar_id": null,
      "url": "https://api.github.com/users/distri",
      "html_url": "https://github.com/distri",
      "followers_url": "https://api.github.com/users/distri/followers",
      "following_url": "https://api.github.com/users/distri/following{/other_user}",
      "gists_url": "https://api.github.com/users/distri/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/distri/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/distri/subscriptions",
      "organizations_url": "https://api.github.com/users/distri/orgs",
      "repos_url": "https://api.github.com/users/distri/repos",
      "events_url": "https://api.github.com/users/distri/events{/privacy}",
      "received_events_url": "https://api.github.com/users/distri/received_events",
      "type": "Organization",
      "site_admin": false
    },
    "network_count": 0,
    "subscribers_count": 2,
    "branch": "master",
    "defaultBranch": "master"
  },
  "dependencies": {}
});