Quadtree
========

TODO: This implementation is too slow... maybe one day we can revisit it.

    Compositions = require "./lib/compositions"

    module.exports = QuadTree = (I={}, self=Core(I)) ->
      Object.defaults I,
        bounds:
          x: 0
          y: 0
          width: 32
          height: 32
        capacity: 4
        minimumArea: 1

      self.include Compositions
      self.attrModel "bounds", Bounds

      items = []
      children = []

      subdivide = ->
        return if children.length
        return if self.bounds().area() <= 1

        {x, y} = bounds = self.bounds()
        midpoint = bounds.midpoint()

        # TODO: Assuming power of two
        width = bounds.width / 2
        height = bounds.height / 2

        children = [
          QuadTree
            x: x
            y: y
            width: width
            height: height
          QuadTree
            x: midpoint.x
            y: y
            width: width
            height: height
          QuadTree
            x: x
            y: midpoint.y
            width: width
            height: height
          QuadTree
            x: midpoint.x
            y: midpoint.y
            width: width
            height: height
        ]

      self.extend
        add: (position, object) ->
          return unless self.bounds().contains(position)

          if (items.length < I.capacity) or (self.bounds().area() <= I.minimumArea)
            items.push [position, object]

            return object
          else
            subdivide()

            for child in children
              if child.add position, object
                return object

        remove: (position, object) ->
        
        query: (bounds, results=[]) ->
          bounds = Bounds(bounds)

          if self.bounds().overlap(bounds)
            items.filter ([position, _]) ->
              bounds.contains(position)
            .forEach ([_, item]) ->
              results.push item

            children.forEach (child) ->
              child.query(bounds, results)

          return results
