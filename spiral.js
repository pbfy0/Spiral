// Generated by CoffeeScript 2.4.1
(function() {
  var arc_mdpt, base, boxes, fib, fib_cache, gr, gr_4, group, initializePath, marker, mousePos, oc, offset, scale, scaleGroup, scale_text, set_invert, settings, spiral, texts, transform, update_text, update_zoom, zoom;

  group = new paper.Group();

  scaleGroup = new paper.Group();

  
function normalizeWheel(/*object*/ event) /*object*/ {
  var PIXEL_STEP  = 10;
  var LINE_HEIGHT = 40;
  var PAGE_HEIGHT = 800;
  var sX = 0, sY = 0,       // spinX, spinY
      pX = 0, pY = 0;       // pixelX, pixelY

  // Legacy
  if ('detail'      in event) { sY = event.detail; }
  if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
  if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
  if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

  // side scrolling on FF with DOMMouseScroll
  if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if ('deltaY' in event) { pY = event.deltaY; }
  if ('deltaX' in event) { pX = event.deltaX; }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode == 1) {          // delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else {                             // delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
  if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

  return { spinX  : sX,
           spinY  : sY,
           pixelX : pX,
           pixelY : pY };
}
;

  mousePos = new paper.paper.Point(0, 0);

  zoom = 1;

  gr = (Math.sqrt(5) - 1) / 2;

  gr_4 = Math.pow(gr, 4);

  marker = null;

  base = Math.pow(gr, 12);

  oc = paper.view.center;

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

  paper.view.onMouseMove = function(ev) {
    return mousePos = ev.point;
  };

  scale = function(n, center) {
    zoom *= n;
    scaleGroup.scale(n, center || marker.position);
    //if settings.labels
    return scale_text();
  };

  transform = function(p, d) {
    if (d === 0) {
      return p;
    }
    if (d === 90) {
      return new paper.Point(-p.x, p.y);
    }
    if (d === 180) {
      return new paper.Point(-p.x, -p.y);
    }
    if (d === 270) {
      return new paper.Point(p.x, -p.y);
    }
  };

  update_text = function() {
    var j, len, ref, results, t;
    ref = texts.children;
    //console.log('update_text')
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      results.push(t.content = (t.data.n + offset) < 0 ? '' : fib(t.data.n + offset));
    }
    return results;
  };

  scale_text = function() {
    var j, len, ref, results, t;
    ref = texts.children;
    //console.log('scale_text')
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      //t.scale(ratio)#, new paper.Point(t.bounds.x + t.bounds.width, t.bounds.y+t.bounds.height-4.95))
      if (settings.labels) {
        t.position = t.data.marker.position - transform(new paper.Point(-t.bounds.width / 2, -t.bounds.height / 2), t.data.dir);
        results.push(t.visible = t.data.n <= 1 ? zoom > 10 : t.data.marker.position.getDistance(marker.position) > 5);
      } else {
        results.push(t.visible = false);
      }
    }
    return results;
  };

  //t.distanceTo(marker) < 10
  document.addEventListener('wheel', function(event) {
    var dd, factor, total_t;
    dd = normalizeWheel(event).pixelY;
    factor = Math.exp(-dd / 400);
    total_t = 1000 / 6;
    //console.log('Start')
    (function() {
      var elapsed, prev, tick;
      elapsed = 0;
      prev = performance.now();
      tick = function(t) {
        var c, delta;
        delta = t - prev;
        prev = t;
        elapsed += delta;
        if (elapsed > total_t) {
          delta -= elapsed - total_t;
        }
        //console.log(t, prev, delta, elapsed)
        c = Math.pow(factor, delta / total_t);
        scale(c, mousePos);
        paper.view.zoom = paper.view.zoom;
        //console.log(zoom)
        if (zoom < base * Math.pow(gr, 12)) {
          scale(Math.pow(gr, -12), null, true);
          offset += 12;
          update_text();
        }
        if (zoom > base * Math.pow(gr, -12) && (offset > 0 || settings.infinite)) {
          scale(Math.pow(gr, 12), null, true);
          offset -= 12;
          update_text();
        }
        if (elapsed < total_t) {
          return requestAnimationFrame(tick);
        }
      };
      return requestAnimationFrame(tick);
    })();
    event.preventDefault();
    return false;
  });

  //i.fontSize *= factor
  arc_mdpt = function(from, to, origin) {
    var angle, mdpt, radius;
    mdpt = new paper.Point((from.x + to.x) / 2, (from.y + to.y) / 2);
    angle = Math.atan2(mdpt.x - origin.x, mdpt.y - origin.y);
    radius = from.getDistance(origin);
    return new paper.Point(origin.x + Math.sin(angle) * radius, origin.y + Math.cos(angle) * radius);
  };

  set_invert = function(val) {
    texts.fillColor = spiral.strokeColor = boxes.strokeColor = val ? 'black' : 'white';
    return paper.view.element.style.backgroundColor = val ? 'white' : 'black';
  };

  texts = new paper.Group();

  spiral = new paper.Group();

  boxes = new paper.Group();

  initializePath = function() {
    var a, arc, arcCenter, b, dir, end, i, j, m, mdpt, r, start, t;
    group.removeChildren();
    arcCenter = new paper.Point(0, 0);
    [a, b] = [0, 1];
    dir = 0;
    marker = new paper.Path.Circle(arcCenter, 0);
    scaleGroup.addChild(marker);
    for (i = j = 0; j <= 40; i = ++j) {
      start = new paper.Point(arcCenter.x, arcCenter.y + b).rotate(dir, arcCenter);
      end = new paper.Point(arcCenter.x + b, arcCenter.y).rotate(dir, arcCenter);
      mdpt = arc_mdpt(start, end, arcCenter);
      arc = new paper.Path.Arc(start, mdpt, end);
      //arc.strokeColor = 'white'
      arc.strokeWidth = 2;
      r = new paper.Path.Rectangle(start, end);
      //r.strokeColor = 'white'
      r.strokeWidth = 0.5;
      m = new paper.Path.Circle(arcCenter, 0);
      
      //if settings.labels
      t = new paper.PointText(arcCenter);
      //t.fillColor = 'white'
      t.fontSize = 12;
      t.data.marker = m;
      t.data.dir = dir;
      t.data.n = i;
      spiral.addChild(arc);
      boxes.addChild(r);
      texts.addChild(t);
      scaleGroup.addChild(m);
      arcCenter = arcCenter.add((new paper.Point(0, a)).rotate(dir + 180));
      [a, b] = [b, a + b];
      dir += 90;
      dir %= 360;
    }
    scaleGroup.addChild(spiral);
    scaleGroup.addChild(boxes);
    group.addChild(texts);
    group.addChild(scaleGroup);
    //scaleGroup.addChild(spiral)
    //scaleGroup.addChild(boxes)
    group.translate(paper.view.center);
    update_text();
    update_zoom(true);
    return set_invert(false);
  };

  update_zoom = function(initial) {
    var n, oz, r;
    oz = zoom;
    scale(1 / zoom);
    if (settings.infinite) {
      scale(base);
      offset = -18;
    } else {
      scale_text(1);
      offset = 0;
    }
    if (!initial) {
      //console.log(zoom/oz)
      r = Math.log(zoom / oz) / Math.log(gr_4);
      //console.log(r)
      n = r - (r | 0);
      scale(Math.pow(gr_4, -n));
    }
  };

  settings = {
    infinite: true,
    labels: false,
    spiral: true,
    boxes: true,
    invert: false
  };

  (function() {
    var gui;
    initializePath();
    gui = new dat.GUI();
    gui.add(settings, 'labels').onChange(function(value) {
      settings.infinite = !value;
      update_zoom();
      if (value) {
        update_text();
        scale_text();
      }
    });
    gui.add(settings, 'spiral').onChange(function(value) {
      return spiral.visible = value;
    });
    gui.add(settings, 'boxes').onChange(function(value) {
      return boxes.visible = value;
    });
    return gui.add(settings, 'invert').onChange(function(value) {
      return set_invert(value);
    });
  })();

  paper.view.onResize = function() {
    group.translate((paper.view.center - oc) / 2);
    return oc = paper.view.center;
  };

}).call(this);
