QuadTree = require "../main"
Bounds = require "../lib/bounds"

global.require = require

describe "QuadTree", ->
  it "should store and query values", ->
    tree = QuadTree()

    positions = [0...1000].map (i) ->
      p = Point(i % 37, i % 43)
      p.i = i

      p

    positions.forEach (position) ->
      tree.insert position

    positions.forEach (position, i) ->
      results = tree.retrieve(position)

      assert results.map((r)->r.i).indexOf(i) >= 0, "results contain #{i}"

  it "should retrieve in bounds", ->
    tree = QuadTree
      width: 50
      height: 50

    positions = [0...1000].map (i) ->
      p = Point(i % 37, i % 43)
      p.i = i

      p

    positions.forEach (position) ->
      tree.insert position

    results = tree.retrieveInBounds
      x: 0
      y: 0
      width: 37
      height: 43

    assert.equal results.length, 1000, "results.length == 1000, actual: #{results.length}"

    results = tree.retrieveInBounds
      x: 0
      y: 0
      width: 16
      height: 43

    results2 = tree.retrieveInBounds
      x: 16
      y: 0
      width: 21
      height: 43

    console.log results.length, results2.length
    total = results.length + results2.length

    assert.equal total, 1000, "Partition total should add up to 1000, actual: #{total}"
