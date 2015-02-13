group = new Group()
group.position = new Point(500, 500)
mousePos = new Point(0, 0)
zoom = 1
gr = (Math.sqrt(5)-1)/2
marker = null
base = Math.pow(gr, 10)

onMouseMove = (ev) ->
	mousePos = ev.point

document.addEventListener 'mousewheel', (event) ->
	factor = 1 + Math.abs(event.wheelDelta / 360)
	if event.wheelDelta < 0
		factor = 1/factor
	i = 0
	c = Math.pow(factor, 1/20)
	cmp = mousePos
	interval = setInterval () ->
		a = group.position
		group.scale(c, cmp)
		b = group.position
		zoom *= c
		view.zoom = view.zoom
		#console.log(zoom)
		if zoom < base*Math.pow(gr, 12)
			zoom *= Math.pow(gr, -12)
			group.scale(Math.pow(gr, -12), marker.position)
		if zoom > base*Math.pow(gr, -12)
			zoom *= Math.pow(gr, 12)
			group.scale(Math.pow(gr, 12), marker.position)
		i++
		console.log(zoom)
		if i > 20
			clearInterval(interval);
	, 1/120
	
arc_mdpt = (from, to, origin) ->
	mdpt = new Point((from.x + to.x) / 2, (from.y + to.y) / 2)
	angle = Math.atan2(mdpt.x - origin.x, mdpt.y - origin.y)
	radius = from.getDistance(origin)
	return new Point(origin.x + Math.sin(angle) * radius, origin.y + Math.cos(angle) * radius)
window.s = this
window.g = group
initializePath = () ->
	arcCenter = new Point(0, 0)
	[a, b] = [0, 1]
	dir = 0
	marker = new Path.Circle(arcCenter, 0)
	group.addChild(marker)
	for i in [0..40]
		start = new Point(arcCenter.x, arcCenter.y+b).rotate(dir, arcCenter)
		end = new Point(arcCenter.x+b, arcCenter.y).rotate(dir, arcCenter)
		mdpt = arc_mdpt(start, end, arcCenter)
		arc = new Path.Arc(start, mdpt, end)
		arc.strokeColor = 'white'
		arc.strokeWidth = 2
		
		r = new Path.Rectangle(start, end)
		r.strokeColor = 'white'
		r.strokeWidth = 0.5
		
		group.addChild(arc)
		group.addChild(r)
		
		arcCenter += (new Point(0, a)).rotate(dir+180)
		[a, b] = [b, a+b]
		dir += 90
		dir %= 360;
	group.translate(500)
	group.scale(base, marker.position)
	zoom *= base
	return

initializePath()