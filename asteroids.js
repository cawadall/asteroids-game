// ASTEROIDS GAME

// Global Variables Declaration
var shapes, asteroids, bullets;
var canvas, background;
var ctx, points, lives, acceleration, ast_counter, angle, c;
const desp = 2;
var starthour, ginterval, inerinterval, timeinterval;
var m;
var exp_counter = 0;

/* Game Initialization */
function init() {

    toContinue();
    // Global Variables Initialization
    shapes = []; // game agents
    asteroids = [];
    bullets = [];
    points = 0;
    lives = 3;
    acceleration = 0;
    ast_counter = 0;
    angle = 0.0;
    c = 1;
    m = 0;

    clearInterval(ginterval);
    clearInterval(inerinterval);
    clearInterval(timeinterval);

    canvas = document.getElementById('canvas');
    if (!canvas) {
    console.log('[ERROR] Failed to retrieve the <canvas> element');
    return false;
    }

    ctx = canvas.getContext('2d');
    shapes.push(new SpaceShip("ss", 50, 75, 20, 20, 'rgba(255, 255, 255, 1)'));
    document.addEventListener('keydown', keyHandler, false);

    // Text gradient
    var gradient=ctx.createLinearGradient(0,0,canvas.width,0);
    gradient.addColorStop("0","#ffa059");
    gradient.addColorStop("0.5","#ff7913");
    gradient.addColorStop("1.0","#a44f10");
    
    ctx.fillStyle=gradient;  
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press Space to start",canvas.width/2,canvas.height/2);
}

// Handler of 'Continue' button
function toContinue() {
    var modal = document.getElementById('myModal');
    modal.style.display = "none"; // oculto la ventana modal
}
// Shows the Menu
function display() {
    var modal = document.getElementById('myModal');
    document.getElementById('cnt').style.display = "inline";
    if (lives <= 0) {
        console.log("tetas");
        document.getElementById('cnt').style.display = "none";
    }
    modal.style.display = "block";
}

/* SpaceShip Constructor */
function SpaceShip(id, x, y, height, base, color) {

    this.id = id;
    this.x = x; // Triangle center
    this.y = y;
    this.w = 0.0;     // rad/seg
    this.theta = 0.0; // rad
    this.height = height;
    this.base = base;
    this.color = color;
    that = this;
    var t = new Date();
    this.time = t.getTime();

    this.draw = function() {
        ctx.save();
        ctx.translate(that.x,that.y);
        ctx.scale(15,15);
        ctx.rotate(that.theta);
        ctx.beginPath();
        ctx.moveTo(0,-1);
        ctx.lineTo(-1,0);
        ctx.lineTo(1,0);
        ctx.fillStyle = that.color;
        ctx.fill();
        ctx.restore();
    }

    this.move = function(desp) {
        // Movement along X axis
        that.y = that.y + desp*Math.cos(that.theta);

        if((that.y - that.height/2)<0) // Canvas Limit control
          that.y = canvas.height;
        if((that.y - that.height/2)>=canvas.height)
          that.y = 0 + that.height/2;
        // Movement along Y axis
        that.x -= desp*Math.sin(that.theta);


        if((that.x - that.height/2)<0) // Canvas Limit control
          that.x = canvas.width;
        if((that.x - that.height/2)>=canvas.width)
          that.x = 0 + that.height/2;

        drawShapes();
    }

    this.rotate = function() {
        var t = new Date();
		var now = t.getTime();
		var dt = now - that.time;
		that.time = now;
        that.theta += (that.w*(dt/1000.0));
        drawShapes();
    }
}

/* Asteroids constructor */
function Asteroid(id, x, y, radious) {

    this.id = id;
    this.x = x;
    this.y = y;
    this.radious = Math.random()*15+5; // [5, 20]
    this.color = 'rgba(255, 255, 255, 1)';

    do {
        this.move_x = (2*Math.random()-1)*(4*Math.random()*-2);
        this.move_y = (2*Math.random()-1)*(4*Math.random()*-2);
    } while (this.move_x == 0 && this.move_y == 0);

    asteroids.push(this.id) // current asteroids list 

    this.draw = function() {

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radious, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    this.moveXaxis = function(despx) {

        this.x = this.x + despx;
        drawShapes();
    }

    this.moveYaxis = function(despy) {

        this.y = this.y + despy;
        drawShapes();
    }
}

/* Bullet Constructor */
function Bullet(ship, id) {

    this.id = id;
    this.x = ship.x;
    this.y = ship.y;
    this.color = 'rgb(255,255,255)';
    this.theta = ship.theta;

    this.draw = function() {

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.theta);
        ctx.scale(2,6);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, -1, -1);
        ctx.restore();
    }

    this.move = function() {

        this.y -= 4*Math.cos(this.theta);
        this.x += 4*Math.sin(this.theta);
        drawShapes();
    }
}

// Draws every object in the scene
function drawShapes() {
    // Clear Canvas and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    for(x in shapes) {
      shapes[x].draw();
    }
}
// Get the object with the specified ID
function getShape(id) {
    for(x in shapes) {
        if(shapes[x].id === id)
            return shapes[x];
    }
}
// Delete an object with the specified ID
function delShape(id) {
    for(x in shapes) {
        if(shapes[x].id === id)
            shapes.splice(x,1);
    }
}

// Asteroids animation
function asteroids_render() { 

    for (var i=0;i<asteroids.length;i++) {

        var obj = getShape(asteroids[i]);
        var dx, dy, distance;

        if(obj !== undefined)
        {
            obj.moveXaxis(obj.move_x);
            if(obj.x > canvas.width || obj.x < 0)
            {
                delShape(asteroids[i]);
                asteroids.splice(i,1);
            }
            obj.moveYaxis(obj.move_y);
            if(obj.y > canvas.height || obj.y < 0)
            {
                delShape(asteroids[i]);
                asteroids.splice(i,1);
            }
            // SpaceShip Impact Control
            ship = getShape("ss");
            dx = ship.x - obj.x;
            dy = ship.y - obj.y;
            distance = Math.sqrt((dx*dx)+(dy*dy));

            if (distance <= 2*obj.radious-2)
            {
                delShape(asteroids[i]);
                asteroids.splice(i,1);
                lives--;
            }
            // Bullet Impact Control
            if (bullets !== undefined)
            {
                for (var j=0;j<bullets.length;j++) {
                    var bullet = getShape(bullets[j]);
                    dx = bullet.x - obj.x;
                    dy = bullet.y - obj.y;
                    distance = Math.sqrt((dx*dx)+(dy*dy));
                    if (distance <= 2*obj.radious-2)
                    {
                        delShape(asteroids[i]);
                        asteroids.splice(i,1);
                        delShape(bullets[j]);
                        bullets.splice(j,1);
                        
                        points += 100;
                    }

                }
            }
        }

        drawShapes();
    }
    status(); // game status control
}

// Asteroids Generator
function generate_asteroids() {
    var initx = canvas.width/2;
    var inity = canvas.height/2;
    ast_counter++;
    shapes.push(new Asteroid("a"+ast_counter.toString(), initx, inity));
    drawShapes();
}


// Inertia and Velocity Control
function inertia(ship) {
    
    ship.rotate();
    ship.move(desp*acceleration);
}

// Shooting control
function shoot() {

    for (var i=0; i<bullets.length; i++) {

        var ob = getShape(bullets[i]);
        if(ob !== undefined)
        {
            ob.move();
            if(ob.x > canvas.width || ob.x < 0 || ob.y > canvas.height || ob.y < 0)
            {
                delShape(bullets[i]);
                bullets.splice(i,1);
            }
        }
        drawShapes();
    }
}

function status() {
    document.getElementById('points').innerHTML = "Points: " + points;
    if (lives <= 0)
    {
        display();
        document.getElementById("msg").innerHTML = "GAME OVER :( RETRY!";
        // Restart
    } else {
        document.getElementById('lives').innerHTML = "Lives: " + lives;
    }
}

function gameTime() {
    var msecPerMinute = 1000 * 60;
    var msecPerHour = msecPerMinute * 60;
    var dateMsec = starthour.getTime();

    var actual = new Date();
    var interval = actual.getTime() - dateMsec;

    var hours = Math.floor(interval / msecPerHour );
    interval = interval - (hours * msecPerHour );

    var minutes = Math.floor(interval / msecPerMinute );
    interval = interval - (minutes * msecPerMinute );

    var seconds = Math.floor(interval / 1000 );

    var hour = hours + " : " + minutes + " : " + seconds;
    document.getElementById("timing").innerHTML = hour;

    // Asteroids Generation period increases with time
    if (minutes>m)
    {
        m++;
        clearInterval(ginterval);
        ginterval = setInterval(generate_asteroids, 1000/Math.pow(1.1,m));
    }
}

// Keyboard Events Handler
function keyHandler(event) {
  var obj;
  obj = getShape("ss");
  if(obj === undefined)
    return;

  switch(event.key) {
    case "w":
      acceleration--
      obj.move(desp*acceleration);
      break;
    case "s":
      acceleration++
      obj.move(desp*acceleration);
      break;
    case "a":
      obj.w -= 0.4;
      obj.rotate();
      break;
    case "d":
      obj.w += 0.4;
      obj.rotate();
      break;

    case "x":
        var interval;
        var id = "bullet" + c;
        b = new Bullet(obj, id);
        shapes.push(b);
        bullets.push(b.id);
        if (c==1)
        {
            setInterval(shoot, 20);
        }
        c++;
        break;
    case " ":
        startGame();
        break;
    default:
      console.log("Key not handled");
  }
}


function startGame() {

  starthour = new Date();    

  ginterval = setInterval(generate_asteroids, 1000);
  setInterval(asteroids_render, 60);
  inerinterval = setInterval(inertia, 50, getShape("ss"));
  timeinterval = setInterval(gameTime, 1000);
}
