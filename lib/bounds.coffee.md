Bounds
------

    Bounds = (arg={}) ->
      {x, y, width, height, __proto__} = arg
      return arg if __proto__ is Bounds.prototype

      x ?= 0
      y ?= 0
      width ?= 1
      height ?= 1

      x: x
      y: y
      width: width
      height: height
      __proto__: Bounds.prototype

    Bounds.prototype =
      midpoint: ->
        Point(@x + @width, @y + @height).scale(0.5)

      area: ->
        @width * @height

      contains: (point) ->
        (@x <= point.x < @x + @width) and
        (@y <= point.y < @y + @height)

      left: ->
        @x

      right: ->
        @x + @width

      top: ->
        @y

      bottom: ->
        @y + @height

      overlap: (bounds) ->
        @top() <= bounds.bottom() and @bottom() > bounds.top()
        @left() <= bounds.right() and @right() > bounds.left()

      toString: ->
        "Bounds({#{@x}, #{@y}}, {#{@width}, #{@height}})"

    module.exports = Bounds
