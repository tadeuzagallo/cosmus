;(function(w, d, undefined) { 
  var canvas = d.getElementById('c'),
      ctx = canvas.getContext('2d');

  canvas.width = canvas.width || canvas.clientWidht;
  canvas.height = canvas.height || canvas.clientHeight;

  var backCanvas = d.createElement('canvas'),
      backCtx = backCanvas.getContext('2d');

  var Astro  = function() {
    function Astro(radius, color, parent, translate_radius, velocity, shadow, texture) {
      this.color = color;
      this.parent = parent;

      if (parent) {
        this.parent = parent;
        this.rotation = this.step = Math.random() * Math.PI * 2;
        this.translate_radius = translate_radius;
        this.velocity = velocity;
        this.texture = texture === false ? false : true;
      } else {
        this.fixed = true;
        this.step = 0;
        this.texture = false;
      }

      this.radius = Math.round(radius);
      this.diameter = this.radius * 2;
      this.shadow = shadow ? true : false;
    }

    a = 0;
    Astro.prototype.draw = function(offset) {
      if (Astro.texture && this.texture) {
        var x, y, _x, _y, width, height;
        x = Math.floor(this.x);
        y = Math.floor(this.y);
        _x = this.x - x;
        _y = this.y - y;
        width = Math.ceil(this.radius + _x) * 2;
        height = Math.ceil(this.radius + _y) * 2;

        backCtx.clearRect(0, 0, width, height);
        backCtx.save();

        backCtx.translate(
          this.radius + _x,
          this.radius + _y
        );

        backCtx.rotate(
          this.rotation
        );

        backCtx.translate(
          -(this.radius + _x),
          -(this.radius + _y)
        );

        backCtx.beginPath();

        backCtx.arc(
          (this.radius + _x),
          (this.radius + _y),
          this.radius,
          0,
          Math.PI * 2,
          false
        );

        backCtx.fillStyle = this.color;
        backCtx.fill();

        backCtx.fillStyle = Astro.texture;
        backCtx.fill();

        backCtx.closePath();

        var image = backCtx.getImageData(0, 0, width, height);
        backCtx.restore();

        ctx.putImageData(
          image,
          x - this.radius,
          y - this.radius
        );

        if (this.shadow) {
          ctx.beginPath();

          var grd = ctx.createLinearGradient(
            this.x - Math.cos(this.step) * this.radius,
            this.y - Math.sin(this.step) * this.radius,
            this.x + Math.cos(this.step) * this.radius,
            this.y + Math.sin(this.step) * this.radius
          );

          grd.addColorStop(0, 'rgba(0,0,0,.3)');
          grd.addColorStop(1, 'rgba(0,0,0,1)');

          ctx.arc(
            this.x, 
            this.y,
            this.radius * 1.04,
            0,
            Math.PI * 2,
            false);

          ctx.fillStyle = grd;
          ctx.fill();
          ctx.closePath();
        }
      } else {
        offset = offset || {x: 0, y: 0};
        ctx.beginPath();
        ctx.arc(this.x + offset.x, this.y + offset.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
    };

    var texture= new Image();
    texture.onload = function() {
      Astro.texture = ctx.createPattern(texture, 'repeat');
    };
    texture.src = 'images/texture.png';
    return Astro;
  }();

  var Galaxy = function() {
    var stars = [],
    astros = [];
    return {
      add_star: function(star) {
        stars.push(star);
        return this;
      },
      add: function(astro) {
        astros.push(astro);
        return this;
      },
      update: function() {
        for (var k = 0, l = astros.length; k < l; k++) {
          var astro = astros[k];
          if (!astro.fixed) {
            astro.step += Math.PI / 180 * astro.velocity;
            astro.step %= Math.PI * 2;

            astro.rotation += Math.PI / 10 * astro.velocity;
            astro.rotation %= Math.PI * 2;

            astro.x = astro.parent.x + Math.cos(astro.step) * (astro.translate_radius + astro.parent.radius + astro.radius);
            astro.y = astro.parent.y + Math.sin(astro.step) * (astro.translate_radius + astro.parent.radius + astro.radius);
          }
        }
        return this;
      },
      draw: function() {
        for (var k = 0, l = stars.length; k < l; k++) {
          stars[k].draw(Galaxy.star_offset);
        }

        for (var k = 0, l = astros.length; k < l; k++) {
          astros[k].draw();
        }
        return this;
      },
      star_offset: {x: 0, y: 0}
    }
  }();

  canvas.onmousemove = function(e) {
    Galaxy.star_offset = {
      x: (e.pageX - this.width / 2) * 0.025,
      y: (e.pageY - this.height / 2) * 0.025
    };
  };

  var sun = new Astro(20, '#C0C000'),
      mercury = new Astro(3, '#3F332C', sun, 50, .2, true),
      venus = new Astro(6, '#CEB735', sun, 61, .3, true),

      earth = new Astro(7, '#00DD00', sun, 95, .1, true),
        moon = new Astro(3, '#DDDDDD', earth, 5.2, .4),

      mars = new Astro(4, 'red', sun, 133, .15, true),
      jupiter = new Astro(10, '#984520', sun, 170, .1, true),
      saturn = new Astro(8, '#C5B156', sun, 216, .18, true),
      uranus = new Astro(7, '#4C88A4', sun, 248, .13, true),
      neptune = new Astro(6, '#192850', sun, 290, .05, true);

  sun.x = canvas.width / 2;
  sun.y = canvas.height / 2;

  for (var k = 0; k < 10; k++) {
    var explosion_core = new Astro(
      1,
      'transparent',
      sun,
      0,
      .5 + Math.random(),
      false,
      false
    ),
    explosion = new Astro(
      .5 + Math.random() * .5,
      '#eebb00',
      explosion_core,
      .2 + Math.random() * .2,
      3 + Math.random() * 3,
      false,
      false
    );

    Galaxy
    .add(explosion_core)
    .add(explosion);
  }

  for (var k = 0; k < 100; k++) {
    var star = new Astro(Math.random() * 1.5, 'white');
    star.x = Math.random() * canvas.width;
    star.y = Math.random() * canvas.height;
    Galaxy.add_star(star);
  };

  Galaxy
  .add(sun)
  .add(mercury)
  .add(venus)
  .add(earth)
  .add(mars)
  .add(jupiter)
  .add(saturn)
  .add(uranus)
  .add(neptune)
  .add(moon);

  (function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Galaxy
    .update()
    .draw();

    w.requestAnimationFrame(update);
  })();
})(window, document);
