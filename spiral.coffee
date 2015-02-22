group = new Group()
scaleGroup = new Group()

mousePos = new Point(0, 0)
zoom = 1
gr = (Math.sqrt(5)-1)/2
gr_4 = Math.pow(gr, 4)
marker = null
base = Math.pow(gr, 12)
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
	scaleGroup.scale(n, center || marker.position)
	#if settings.labels
	scale_text()
transform = (p, d) ->
	if d == 0 then return p
	if d == 90 then return new Point(-p.x, p.y)
	if d == 180 then return new Point(-p.x, -p.y)
	if d == 270 then return new Point(p.x, -p.y)
update_text = () ->
	#console.log('update_text')
	for t in texts.children
		t.content = if (t.data.n + offset) < 0 then '' else fib(t.data.n + offset)

scale_text = () ->
	#console.log('scale_text')
	for t in texts.children
		#t.scale(ratio)#, new Point(t.bounds.x + t.bounds.width, t.bounds.y+t.bounds.height-4.95))
		if settings.labels
			t.position = t.data.marker.position - transform(new Point(-t.bounds.width/2, -t.bounds.height/2), t.data.dir)
			t.visible = if t.data.n <= 1 then zoom > 10 else t.data.marker.position.getDistance(marker.position) > 5
		else
			t.visible = false
		#t.distanceTo(marker) < 10
			
document.addEventListener 'mousewheel', (event) ->
	factor = 1 + Math.abs(event.wheelDelta / 360)
	if event.wheelDelta < 0
		factor = 1/factor
	total_t = 1000/6
	#console.log('Start')
	do () ->
		elapsed = 0
		prev = performance.now()
		tick = (t) ->
			delta = t - prev
			prev = t
			elapsed += delta
			if elapsed > total_t then delta -= elapsed - total_t
			#console.log(t, prev, delta, elapsed)
			c = Math.pow(factor, delta / total_t)
			scale(c, mousePos)
			view.zoom = view.zoom
			#console.log(zoom)
			if zoom < base*Math.pow(gr, 12)
				scale(Math.pow(gr, -12), null, true)
				offset += 12
				update_text()
			if zoom > base*Math.pow(gr, -12) and (offset > 0 or settings.infinite)
				scale(Math.pow(gr, 12), null, true)
				offset -= 12
				update_text()
			if elapsed < total_t
				requestAnimationFrame(tick)
		requestAnimationFrame(tick)
	event.preventDefault()
	return false
		#i.fontSize *= factor
	
arc_mdpt = (from, to, origin) ->
	mdpt = new Point((from.x + to.x) / 2, (from.y + to.y) / 2)
	angle = Math.atan2(mdpt.x - origin.x, mdpt.y - origin.y)
	radius = from.getDistance(origin)
	return new Point(origin.x + Math.sin(angle) * radius, origin.y + Math.cos(angle) * radius)
set_invert = (val) ->
	texts.fillColor = spiral.strokeColor = boxes.strokeColor = if val then 'black' else 'white'
	view.element.style.backgroundColor = if val then 'white' else 'black'

texts = new Group()
spiral = new Group()
boxes = new Group()

initializePath = () ->
	group.removeChildren()
	arcCenter = new Point(0, 0)
	[a, b] = [0, 1]
	dir = 0
	marker = new Path.Circle(arcCenter, 0)
	scaleGroup.addChild(marker)
	for i in [0..40]
		start = new Point(arcCenter.x, arcCenter.y+b).rotate(dir, arcCenter)
		end = new Point(arcCenter.x+b, arcCenter.y).rotate(dir, arcCenter)
		mdpt = arc_mdpt(start, end, arcCenter)
		arc = new Path.Arc(start, mdpt, end)
		#arc.strokeColor = 'white'
		arc.strokeWidth = 2
		
		r = new Path.Rectangle(start, end)
		#r.strokeColor = 'white'
		r.strokeWidth = 0.5
		
		m = new Path.Circle(arcCenter, 0)
		
		#if settings.labels
		t = new PointText(arcCenter)
		#t.fillColor = 'white'
		t.fontSize = 12
		t.data.marker = m
		t.data.dir = dir
		t.data.n = i
		
		spiral.addChild(arc)
		boxes.addChild(r)
		texts.addChild(t)
		scaleGroup.addChild(m)
		
		arcCenter += (new Point(0, a)).rotate(dir+180)
		[a, b] = [b, a+b]
		dir += 90
		dir %= 360;
	scaleGroup.addChild(spiral)
	scaleGroup.addChild(boxes)
	
	group.addChild(texts)
	group.addChild(scaleGroup)
	#scaleGroup.addChild(spiral)
	#scaleGroup.addChild(boxes)
	group.translate(view.center)
	update_text()
	update_zoom(true)
	set_invert(false)

update_zoom = (initial) ->
	oz = zoom
	scale(1/zoom)
	if settings.infinite
		scale(base)
		offset = -18
	else
		scale_text(1)
		offset = 0
	if not initial
		#console.log(zoom/oz)
		r = Math.log(zoom/oz) / Math.log(gr_4)
		#console.log(r)
		n = r - (r | 0)
		scale(Math.pow(gr_4, -n))

	return

settings = {infinite: true, labels: false, spiral: true, boxes: true, invert: false}

do () ->
	initializePath()
	
	gui = new dat.GUI()
	gui.add(settings, 'labels').onChange (value) ->
		settings.infinite = not value
		update_zoom()
		if value
			update_text()
			scale_text()
		return
	gui.add(settings, 'spiral').onChange (value) ->
		spiral.visible = value
	gui.add(settings, 'boxes').onChange (value) ->
		boxes.visible = value
	gui.add(settings, 'invert').onChange (value) ->
		set_invert(value)

onResize = () ->
	group.translate((view.center - oc) / 2)
	oc = view.center