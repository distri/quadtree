QuadTree = require "../main"
Bounds = require "../lib/bounds"

global.require = require

describe "QuadTree", ->
  it "should store and query values", ->
    tree = QuadTree()

    positions = [0...1000].map (i) ->
      p = Point(rand(i % 37), rand(i % 43))
      p.i = i

      p

    positions.forEach (position) ->
      tree.insert position

    positions.forEach (position, i) ->
      results = tree.retrieve(position)

      assert results.map((r)->r.i).indexOf(i) >= 0, "results contain #{i}"

describe "Bounds", ->
  it "should exist", ->
    assert Bounds
  
  it "instances should be instances", ->
    assert Bounds() instanceof Bounds
