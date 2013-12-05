QuadTree = require "../main"
Bounds = require "../lib/bounds"

global.require = require

describe "QuadTree", ->
  it "should store and query values", ->
    tree = QuadTree()

    positions = [0...1000].map (i) ->
      p = Point(rand(32), rand(32))
      p.i = i

      p

    positions.forEach (position) ->
      console.log position
      tree.insert position

    positions.forEach (position, i) ->
      q = Bounds(position)
      console.log q
      results = tree.retrieve(q)

      assert results.map((r)->r.i).indexOf(i) >= 0, "results contain #{i}"

describe "Bounds", ->
  it "should exist", ->
    console.log Bounds
    assert Bounds
  
  it "instances should be instances", ->
    assert Bounds() instanceof Bounds
