var width, height, center;
var points = 10;
var smooth = true;
var path = new Path();
var mousePos = view.center / 2;
var pathHeight = mousePos.y;
path.fillColor = 'black';
var origin = new Point(0, 0);
var group = new Group();
//group.position = view.projectToView(view.center);
//initializePath();

function onMouseMove(ev){
	mousePos = ev.point;
}

document.addEventListener('mousewheel', function(event){
	//console.log(event);
	var n = 1 + Math.abs(event.wheelDelta) / 360;
	if(event.wheelDelta < 0) n = 1/n;
	var cmp = mousePos;
	var i = 0;
	var c = Math.pow(n, 0.05);
	var in_ = setInterval(function(){
		group.scale(c, cmp);
		view.zoom = view.zoom;
		i++;
		if(i > 20) clearInterval(in_);
	}, 5);
	//group.scale(n, mousePos);
	//console.log(group.position, group.scaling);
	//view.zoom = view.zoom;
	/*var d = view.center - mousePos;
	//console.log(d, d / view.zoom, view.zoom);
	var a = view.viewToProject(mousePos);
	var tr = view.projectToView(a / view.zoom + origin - a / (view.zoom * n));
	console.log(tr);
	view.scrollBy(-tr);
	origin = tr;
	view.zoom *= n*/
	//console.log(n, a, b);
});

function gen_mp(from, to, origin){
	var mdpt = new Point((from.x + to.x) / 2, (from.y + to.y) / 2);
	var angle = Math.atan2(mdpt.x - origin.x, mdpt.y - origin.y);
	var radius = from.getDistance(origin);
	//var radius = Math.sqrt(Math.pow((origin.x - from.x), 2) + Math.pow((origin.y - from.y), 2));
	var amdpt = new Point(origin.x + Math.sin(angle) * radius, origin.y + Math.cos(angle) * radius);
	return amdpt;
}

function initializePath() {
	var origin = new Point(0, 0);
	var a = 0, b = 1;
	var dir = 0;
	//matrix = matrix.rotate(90);
	n = 0;
	for(var i = 0; i < 100; i++){
		var start = new Point(origin.x, origin.y+b).rotate(n*90, origin);//.add(origin)//.transform(matrix);
		var end = new Point(origin.x+b, origin.y).rotate(n*90, origin);//.add(origin)//.transform(matrix);
		var mid = gen_mp(start, end, origin);
		//console.log(origin);
		var arc = new Path.Arc(start, mid, end);
		arc.strokeColor = 'white';
		arc.strokeWidth = 2;
		//new Path.Circle(origin+500, 2).fillColor = 'black';
		var r = new Path.Rectangle(start, end);
		group.addChild(r);
		group.addChild(arc);
		r.strokeColor = 'white';
		r.strokeWidth = 0.5;
		origin += (new Point(0, a)).rotate((n+2)*90);//transform(matrix);
		var c = a+b;
		a = b;
		b = c;
		n++;
		n%=4;
		//matrix = matrix.rotate(Math.PI/2, new Point(0, 0));
	}
		
}
initializePath();
/*function onResize(event) {
	initializePath();
}*/