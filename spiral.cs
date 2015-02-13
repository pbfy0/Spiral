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
transform = (p, d) ->
	if d == 0 then return p
	if d == 90 then return new Point(-p.x, p.y)
	if d == 180 then return new Point(-p.x, -p.y)
	if d == 270 then return new Point(p.x, -p.y)
update_text = () ->
	for t in texts
		t.content = fib(t.data.n + offset)
scale_text = (ratio) ->
	for t in texts
		t.data.scale *= ratio
		t.scale(ratio)#, new Point(t.bounds.x + t.bounds.width, t.bounds.y+t.bounds.height-4.95))
		t.position = t.data.marker.position - transform(new Point(-t.bounds.width/2, -t.bounds.height/2), t.data.dir)
		t.visible = if t.data.n <= 1 then t.data.scale < 0.1 else t.data.marker.position.getDistance(marker.position) > 5
		#t.distanceTo(marker) < 10
			
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
		scale_text(1/c)
		#console.log(texts[0].sss)
		zoom *= c
		view.zoom = view.zoom
		#console.log(zoom)
		if zoom < base*Math.pow(gr, 12)
			zoom *= Math.pow(gr, -12)
			group.scale(Math.pow(gr, -12), marker.position)
			offset += 12
			update_text()
			scale_text(Math.pow(gr, 12))
		if zoom > base*Math.pow(gr, -12)# and offset > 0
			zoom *= Math.pow(gr, 12)
			group.scale(Math.pow(gr, 12), marker.position)
			offset -= 12
			update_text()
			scale_text(Math.pow(gr, -12))
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
window.t = texts
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
		
		m = new Path.Circle(arcCenter, 0)
		
		
		#t = new PointText(arcCenter)
		#t.fillColor = 'white'
		#t.fontSize = 12
		#t.data.marker = m
		#t.data.dir = dir
		#t.data.n = i
		#t.data.scale = 1
		#t.translate(-t.bounds.width, 0)
		#texts.push(t)
		
		group.addChild(arc)
		group.addChild(r)
		#group.addChild(t)
		group.addChild(m)
		
		arcCenter += (new Point(0, a)).rotate(dir+180)
		[a, b] = [b, a+b]
		dir += 90
		dir %= 360;
	group.translate(view.center)
	group.scale(base, marker.position)
	offset = -18
	update_text()
	#scale_text(1)
	scale_text(1/base)
	zoom *= base
	return

initializePath()

onResize = () ->
	group.translate((view.center - oc) / 2)
	oc = view.center