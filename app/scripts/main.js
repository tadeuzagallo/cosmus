;(function(w, d, undefined) { 
  var canvas = d.getElementById('c'),
      ctx = canvas.getContext('2d');
  canvas.width = canvas.width || canvas.clientWidht;
  canvas.height = canvas.height || canvas.clientHeight;
  
  var backCanvas = d.createElement('canvas'),
      backCtx = backCanvas.getContext('2d');

  var Astro  = function() {
    function Astro(radio, color, parent, translate_radio, velocity, shadow, texture) {
      this.radio = radio;
      this.color = color;
      this.parent = parent;

      if (parent) {
        this.parent = parent;
        this.rotation = this.step = Math.random() * Math.PI * 2;
        this.translate_radio = translate_radio;
        this.velocity = velocity;
        this.texture = texture === false ? false : true;
      } else {
        this.fixed = true;
        this.step = 0;
        this.texture = false;
      }

      this.shadow = shadow ? true : false;
    }

    Astro.prototype.draw = function(offset) {
      backCtx.clearRect(0, 0, this.radio * 2 + 1, this.radio * 2 + 1);
      backCtx.save();

      backCtx.translate(this.radio, this.radio);
      backCtx.rotate(this.rotation);
      backCtx.translate(-this.radio, -this.radio);

      backCtx.beginPath();
      backCtx.fillStyle = this.color;
      backCtx.arc(this.radio, this.radio, this.radio, 0, Math.PI * 2, false);
      backCtx.fill();

      if (Astro.texture && this.texture) {
        backCtx.fillStyle = Astro.texture;
        backCtx.fill();
      }

      backCtx.closePath();


      var image = backCtx.getImageData(0, 0, this.radio * 2, this.radio * 2);
      backCtx.restore();
      //ctx.putImageData(image, this.x - this.radio, this.y - this.radio);

      if (this.shadow) {
        ctx.beginPath();

        var grd = ctx.createLinearGradient(
          this.x - Math.cos(this.step) * this.radio,
          this.y - Math.sin(this.step) * this.radio,
          this.x + Math.cos(this.step) * this.radio,
          this.y + Math.sin(this.step) * this.radio
        );

        grd.addColorStop(0, 'rgba(0,0,0,.3)');
        grd.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = 'white';

        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2, false);

        ctx.fill();
        ctx.fillStyle = grd;
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
      },
      add: function(astro) {
        astros.push(astro);
      },
      update: function() {
        for (var k = 0, l = astros.length; k < l; k++) {
          var astro = astros[k];
          if (!astro.fixed) {
            astro.step += Math.PI / 180 * astro.velocity;
            astro.step %= Math.PI * 2;

            astro.rotation += Math.PI / 10 * astro.velocity;
            astro.rotation %= Math.PI * 2;

            astro.x = astro.parent.x + Math.cos(astro.step) * (astro.translate_radio + astro.parent.radio + astro.radio);
            astro.y = astro.parent.y + Math.sin(astro.step) * (astro.translate_radio + astro.parent.radio + astro.radio);
          }
        }
      },
      draw: function() {
        for (var k = 0, l = stars.length; k < l; k++) {
          stars[k].draw(Galaxy.star_offset);
        }

        for (var k = 0, l = astros.length; k < l; k++) {
          astros[k].draw();
        }
      },
      star_offset: {x: 0, y: 0}
    }
  }();

  canvas.onmousemove = function(e) {
    var o = Galaxy.star_offset;
    Galaxy.star_offset = {x: o.x + ((e.pageX * .025 - o.x) % 2), y: o.y + ((e.pageY * 0.025 - o.y) % 2)};
  };

  var sun = new Astro(20, 'yellow'),
      mercury = new Astro(2.4, '#3F332C', sun, 50, .2, true),
      venus = new Astro(6.05, '#CEB735', sun, 61, .3, true),

      earth = new Astro(6.37, 'green', sun, 95, .1, true),
        moon = new Astro(2, 'white', earth, 5.2, .4),

      mars = new Astro(3.4, 'red', sun, 133, .15, true),
      jupiter = new Astro(10, '#984520', sun, 170, .05, true),
      saturn = new Astro(8, '#C5B156', sun, 216, .18, true),
      uranus = new Astro(7.5, '#4C88A4', sun, 248, .13, true),
      neptune = new Astro(7, '#192850', sun, 290, .05, true);

  sun.x = canvas.width / 2;
  sun.y = canvas.height / 2;

  for (var k = 0; k < 10; k++) {
    var explosion_core = new Astro(1, 'transparent', sun, 0, .5 + Math.random());
    var explosion = new Astro(.5 + Math.random() * .5,
                              '#eebb00',
                              explosion_core,
                              .2 + Math.random() * .2,
                              3 + Math.random() * 3,
                              false,
                              false);
    Galaxy.add(explosion_core);
    Galaxy.add(explosion);
    console.log(explosion.texture);
  }

  for (var k = 0; k < 100; k++) {
    var star = new Astro(Math.random() * 1.5, 'white');
    star.x = Math.random() * canvas.width;
    star.y = Math.random() * canvas.height;
    Galaxy.add_star(star);
  };

  Galaxy.add(sun);
  Galaxy.add(mercury);
  Galaxy.add(venus);
  Galaxy.add(earth);
  Galaxy.add(mars);
  Galaxy.add(jupiter);
  Galaxy.add(saturn);
  Galaxy.add(uranus);
  Galaxy.add(neptune);
  Galaxy.add(moon);

  (function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Galaxy.update();
    Galaxy.draw();
    w.requestAnimationFrame(update);
  })();
})(window, document);
