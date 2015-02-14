group = new Group()

mousePos = new Point(0, 0)
zoom = 1
gr = (Math.sqrt(5)-1)/2
marker = null
base = Math.pow(gr, 10)
oc = view.center
offset = 0

fib_cache = {}
fib = (n) ->
	if n of fib_cache then return fib_cache[n]
	if n < 0 then return 0
	if n == 0 then return 1
	return fib_cache[n] = fib(n-1) + fib(n-2)

onMouseMove = (ev) ->
	mousePos = ev.point

scale = (n, center) ->
	zoom *= n
	group.scale(n, center || marker.position)
	#if settings.numbers
	scale_text(1/n)
transform = (p, d) ->
	if d == 0 then return p
	if d == 90 then return new Point(-p.x, p.y)
	if d == 180 then return new Point(-p.x, -p.y)
	if d == 270 then return new Point(p.x, -p.y)
update_text = () ->
	console.log('update_text')
	for t in texts
		t.content = if (t.data.n + offset) < 0 then '' else fib(t.data.n + offset)

scale_text = (ratio) ->
	console.log('scale_text')
	for t in texts
		t.scale(ratio)#, new Point(t.bounds.x + t.bounds.width, t.bounds.y+t.bounds.height-4.95))
		if settings.numbers
			t.position = t.data.marker.position - transform(new Point(-t.bounds.width/2, -t.bounds.height/2), t.data.dir)
			t.visible = if t.data.n <= 1 then zoom > 15 else t.data.marker.position.getDistance(marker.position) > 5
			if not t.visible then console.log(t.data.n, zoom)
		else
			t.visible = false
		#t.distanceTo(marker) < 10
			
document.addEventListener 'mousewheel', (event) ->
	factor = 1 + Math.abs(event.wheelDelta / 360)
	if event.wheelDelta < 0
		factor = 1/factor
	i = 0
	c = Math.pow(factor, 1/20)
	cmp = mousePos
	interval = setInterval () ->
		scale(c, cmp)
		view.zoom = view.zoom
		#console.log(zoom)
		if zoom < base*Math.pow(gr, 12)
			scale(Math.pow(gr, -12), null, true)
			offset += 12
			update_text()
		if zoom > base*Math.pow(gr, -12) and (offset > 0 or settings.infiniteIn)
			scale(Math.pow(gr, 12), null, true)
			offset -= 12
			update_text()
		i++
		if i > 20
			clearInterval(interval);
	, 1/120

	return 
		#i.fontSize *= factor
	
arc_mdpt = (from, to, origin) ->
	mdpt = new Point((from.x + to.x) / 2, (from.y + to.y) / 2)
	angle = Math.atan2(mdpt.x - origin.x, mdpt.y - origin.y)
	radius = from.getDistance(origin)
	return new Point(origin.x + Math.sin(angle) * radius, origin.y + Math.cos(angle) * radius)
texts = []
centers = []
window.t = texts
initializePath = () ->
	group.removeChildren()
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
		
		m = new Path.Circle(arcCenter, 0)
		
		#if settings.numbers
		t = new PointText(arcCenter)
		t.fillColor = 'white'
		t.fontSize = 12
		t.data.marker = m
		t.data.dir = dir
		t.data.n = i
		t.data.scale = 1
		t.translate(-t.bounds.width, 0)
		texts.push(t)
		group.addChild(t)
		
		group.addChild(arc)
		group.addChild(r)
		group.addChild(m)
		
		arcCenter += (new Point(0, a)).rotate(dir+180)
		[a, b] = [b, a+b]
		dir += 90
		dir %= 360;
	group.translate(view.center)
	update_text()
	update_zoom()
update_zoom = () ->
	scale(1/zoom)
	offset = 0
	zoom = 1
	if settings.infiniteIn
		scale(base)
		offset = -18
	else
		scale_text(1)
	return

initializePath()
settings = {infiniteIn: true, numbers: false}
do () ->
	window.gui = new dat.GUI()
	numbers = null
	gui.add(settings, 'infiniteIn').onChange (value) ->
		update_zoom()
		if value
			settings.numbers = false
			gui.remove(numbers)
		else
			numbers = gui.add(settings, 'numbers')
			numbers.onChange (value) ->
				update_text()
				scale_text(1)
				return
			console.log(numbers)
		return

onResize = () ->
	group.translate((view.center - oc) / 2)
	oc = view.center