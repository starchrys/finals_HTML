const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

//adjust canvas width/height to take full screen
canvas.width= innerWidth;
canvas.height= innerHeight;

//img function to easily import images
function img(file){
    const image = new Image();
    image.src = 'sprites/' +file;
    return image;
}

//Declaring variables
const gravity = 0.5; //Global Gravity
var firstSplash = 1;
var lastSplash = 210;
var splash = new Image;
var timer = setInterval( function(){
  if (firstSplash>lastSplash){
    clearInterval( timer );
  }else{
    splash.src = "./sprites/Splash/splash("+( firstSplash++ )+").jpg";
  }
}, 1000/30 ); //Draw at 30 frames per second

//Levels
let level = 1
let levels = {
  1: {
    init: () => {

    }
  }

}



class Player {
  constructor(){ // Player Position/Width/Height
    this.position = {
      x: 100,
      y: 100
    }
    this.velocity = {  // Player Gravity
      x: 0,
      y: 1
    }

    this.width = 30;
    this.height = 30;
  }

  // Make Player Visible
  draw(){
    ctx.fillStyle = 'red';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update(){ 
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    
    // Gravity to Player
    if (this.position.y + this.height +  this.velocity.y <= canvas.height)
      this.velocity.y += gravity;
    else this.velocity.y = 0;
  }
}

class Platform {
  constructor() {
    this.position = {
      x: 200,
      y: 100
    }

    this.width = 200
    this.height = 20
  }

  draw() {
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

// Declaring variables
const player = new Player();
const platform = new Platform();
const keys = {
  right:{
    pressed: false
  },
  left:{
    pressed: false
  }
}

function drawSplash(){
  splash.onload = function(){
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    ctx.drawImage(splash, 0, 0, ctx.canvas.width, ctx.canvas.height);
  };
}


function gameStart(){
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width, canvas.height)
    document.getElementById("btnStart").remove();
    animate();
    player.draw();
}


function animate(){ // Animate
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  platform.draw();

  // Hold A/D for moving player
  if (keys.right.pressed){
    player.velocity.x = 5
  } else if (keys.left.pressed) {
    player.velocity.x = -5
  } else player.velocity.x = 0

  // Platform detection for player
  if (player.position.y + player.height <= platform.position.y && player.position.y + player.height + player.velocity.y >= platform.position.y) {
    player.velocity.y = 0;
  }
}

document.body.addEventListener('keydown', keyDown);
document.body.addEventListener('keyup', keyUp);

function keyDown(event){
    if(event.code == "ArrowUp"){
        player.velocity.y -= 20;
    }

    if(event.code == "ArrowLeft"){
      keys.left.pressed = true;
    }

    if(event.code == "ArrowRight"){
      keys.right.pressed = true;
    }
}

function keyUp(event){
  if(event.code == "ArrowUp"){
      player.velocity.y -= 20;
  }

  if(event.code == "ArrowLeft"){
    keys.left.pressed = false;
  }

  if(event.code == "ArrowRight"){
    keys.right.pressed = false;
  }
}
drawSplash();
levels[level].init()