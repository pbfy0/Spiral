// Generated by CoffeeScript 1.9.0
var arc_mdpt, base, boxes, fib, fib_cache, gr, gr_4, group, initializePath, marker, mousePos, oc, offset, onMouseMove, onResize, scale, scale_text, settings, spiral, texts, transform, update_text, update_zoom, zoom;

group = new Group();

mousePos = new Point(0, 0);

zoom = 1;

gr = (Math.sqrt(5) - 1) / 2;

gr_4 = Math.pow(gr, 4);

marker = null;

base = Math.pow(gr, 12);

oc = view.center;

offset = 0;

fib_cache = {};

fib = function(n) {
  if (n in fib_cache) {
    return fib_cache[n];
  }
  if (n < 0) {
    return 0;
  }
  if (n === 0) {
    return 1;
  }
  return fib_cache[n] = fib(n - 1) + fib(n - 2);
};

onMouseMove = function(ev) {
  return mousePos = ev.point;
};

scale = function(n, center) {
  zoom *= n;
  group.scale(n, center || marker.position);
  return scale_text(1 / n);
};

transform = function(p, d) {
  if (d === 0) {
    return p;
  }
  if (d === 90) {
    return new Point(-p.x, p.y);
  }
  if (d === 180) {
    return new Point(-p.x, -p.y);
  }
  if (d === 270) {
    return new Point(p.x, -p.y);
  }
};

update_text = function() {
  var t, _i, _len, _ref, _results;
  console.log('update_text');
  _ref = texts.children;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    t = _ref[_i];
    _results.push(t.content = (t.data.n + offset) < 0 ? '' : fib(t.data.n + offset));
  }
  return _results;
};

scale_text = function(ratio) {
  var t, _i, _len, _ref, _results;
  console.log('scale_text');
  _ref = texts.children;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    t = _ref[_i];
    t.scale(ratio);
    if (settings.labels) {
      t.position = t.data.marker.position - transform(new Point(-t.bounds.width / 2, -t.bounds.height / 2), t.data.dir);
      t.visible = t.data.n <= 1 ? zoom > 10 : t.data.marker.position.getDistance(marker.position) > 5;
      if (!t.visible) {
        _results.push(console.log(t.data.n, zoom));
      } else {
        _results.push(void 0);
      }
    } else {
      _results.push(t.visible = false);
    }
  }
  return _results;
};

document.addEventListener('mousewheel', function(event) {
  var c, cmp, factor, i, interval;
  factor = 1 + Math.abs(event.wheelDelta / 360);
  if (event.wheelDelta < 0) {
    factor = 1 / factor;
  }
  i = 0;
  c = Math.pow(factor, 1 / 20);
  cmp = mousePos;
  interval = setInterval(function() {
    scale(c, cmp);
    view.zoom = view.zoom;
    if (zoom < base * Math.pow(gr, 12)) {
      scale(Math.pow(gr, -12), null, true);
      offset += 12;
      update_text();
    }
    if (zoom > base * Math.pow(gr, -12) && (offset > 0 || settings.infiniteIn)) {
      scale(Math.pow(gr, 12), null, true);
      offset -= 12;
      update_text();
    }
    i++;
    if (i > 20) {
      return clearInterval(interval);
    }
  }, 1 / 120);
});

arc_mdpt = function(from, to, origin) {
  var angle, mdpt, radius;
  mdpt = new Point((from.x + to.x) / 2, (from.y + to.y) / 2);
  angle = Math.atan2(mdpt.x - origin.x, mdpt.y - origin.y);
  radius = from.getDistance(origin);
  return new Point(origin.x + Math.sin(angle) * radius, origin.y + Math.cos(angle) * radius);
};

texts = new Group();

spiral = new Group();

boxes = new Group();

window.t = texts;

initializePath = function() {
  var a, arc, arcCenter, b, dir, end, i, m, mdpt, r, start, t, _i, _ref, _ref1;
  group.removeChildren();
  arcCenter = new Point(0, 0);
  _ref = [0, 1], a = _ref[0], b = _ref[1];
  dir = 0;
  marker = new Path.Circle(arcCenter, 0);
  group.addChild(marker);
  for (i = _i = 0; _i <= 40; i = ++_i) {
    start = new Point(arcCenter.x, arcCenter.y + b).rotate(dir, arcCenter);
    end = new Point(arcCenter.x + b, arcCenter.y).rotate(dir, arcCenter);
    mdpt = arc_mdpt(start, end, arcCenter);
    arc = new Path.Arc(start, mdpt, end);
    arc.strokeColor = 'white';
    arc.strokeWidth = 2;
    r = new Path.Rectangle(start, end);
    r.strokeColor = 'white';
    r.strokeWidth = 0.5;
    m = new Path.Circle(arcCenter, 0);
    t = new PointText(arcCenter);
    t.fillColor = 'white';
    t.fontSize = 12;
    t.data.marker = m;
    t.data.dir = dir;
    t.data.n = i;
    t.translate(-t.bounds.width, 0);
    spiral.addChild(arc);
    boxes.addChild(r);
    texts.addChild(t);
    group.addChild(m);
    arcCenter += (new Point(0, a)).rotate(dir + 180);
    _ref1 = [b, a + b], a = _ref1[0], b = _ref1[1];
    dir += 90;
    dir %= 360;
  }
  group.addChild(spiral);
  group.addChild(boxes);
  group.addChild(texts);
  group.translate(view.center);
  update_text();
  return update_zoom(true);
};

update_zoom = function(initial) {
  var n, oz, r;
  oz = zoom;
  scale(1 / zoom);
  if (settings.infiniteIn) {
    scale(base);
    offset = -18;
  } else {
    scale_text(1);
    offset = 0;
  }
  if (!initial) {
    console.log(zoom / oz);
    r = Math.log(zoom / oz) / Math.log(gr_4);
    console.log(r);
    n = r - (r | 0);
    scale(Math.pow(gr_4, -n));
  }
};

initializePath();

settings = {
  infiniteIn: true,
  labels: false,
  spiral: true,
  boxes: true
};

(function() {
  window.gui = new dat.GUI();
  gui.add(settings, 'labels').onChange(function(value) {
    settings.infiniteIn = !value;
    update_zoom();
    if (value) {
      update_text();
      scale_text(1);
    }
  });
  gui.add(settings, 'spiral').onChange(function(value) {
    return spiral.visible = value;
  });
  return gui.add(settings, 'boxes').onChange(function(value) {
    return boxes.visible = value;
  });
})();

onResize = function() {
  group.translate((view.center - oc) / 2);
  return oc = view.center;
};
