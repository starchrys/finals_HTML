const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

//adjust canvas width/height to take full screen
canvas.width= 1680;
canvas.height= 945;

//img function to easily import images
function img(file){
    const image = new Image();
    image.src = 'sprites/' +file;
    return image;
}

//declaring images
  const platformImg = img('platform.png');
  const bg1 = img('bg1.png');
  const bg2 = img('bg2.png');
  const bg3 = img('bg3.png');
  const bg4 = img('bg4.png');
  const bg5 = img('bg5.png');
  const idle_right = img('idle_right.png');
  const run_right = img('run_right.png');
  const idle_left = img('idle_left.png');
  const run_left = img('run_left.png');
  const platform_small = img('platform_small.png');
  const platform_med = img('platform_medium.png');
  const platform_bottom = img('platform_bottom.png');
  const platform_sblock = img('platform_sblock.png');
  const platform_upperleft = img('platform_upperleft.png');
  const platform_upperright = img('platform_upperright.png');
  const platform_zblock = img('platform_zblock.png');

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



class Player {
  constructor(){ // Player Position/Width/Height
    this.position = {
      x: 100,
      y: 667
    }
    this.velocity = {  // Player Gravity
      x: 0,
      y: 0
    }

    this.width = 104;
    this.height = 128;
    this.image = idle_right;
    this.frames = 0;
    this.sprites = {
      idle: {
        right: idle_right,
        left: idle_left,
        cropWidth: 208,
        cropHeight: 256,
        frameLimit: 36
      },
      run: {
        right: run_right,
        left: run_left,
        cropWidth: 208,
        cropHeight: 272,
        frameLimit: 48
      }
    }
    this.currentSprite = this.sprites.idle.right;
    this.currentCropWidth = 208;
    this.currentCropHeight = 256;
    this.currentFrameLimit = 36;
  }

  // Make Player Visible
  draw(){
    ctx.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      this.currentCropHeight, 
      this.position.x, 
      this.position.y, 
      this.width, 
      this.height)
  }

  update(){ 
    this.frames++;
    if (this.frames>=this.currentFrameLimit) this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    
    // Gravity to Player
    if (this.position.y + this.height +  this.velocity.y <= canvas.height)
      this.velocity.y += gravity;
  }
}

class Platform {
  constructor({x, y, image}) {
    this.position = {
      x,
      y
    }

    this.width = 600
    this.height = 180
    this.image = image
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y)
  }
}

class Decoration {
  constructor({x, y, image}) {
    this.position = {
      x,
      y
    }

    this.width = 16800
    this.height = 945
    this.image = image
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y)
  }
}

//Declaring variables
let player = new Player();
let platforms = []
let decorations = [
  new Decoration({
    x:0,
    y:0,
    image: bg1
  }),
  bg2Deco = new Decoration({
    x:0,
    y:0,
    image: bg2
  }),
  bg3Deco = new Decoration({
    x:0,
    y:0,
    image: bg3
  }),
  bg4Deco = new Decoration({
    x:0,
    y:0,
    image: bg4
  }),
  bg5Deco = new Decoration({
    x:0,
    y:0,
    image: bg5
  })
]
const keys = {
  right:{
    pressed: false
  },
  left:{
    pressed: false
  }
}

let scrollOffset = 0;

//Levels
let level = 1
let levels = {
  1: {
    init: () => {
      player = new Player();
      platforms = [new Platform({
        x: -1,
        y: 800,
        image: platformImg
      })]
      decorations = [
        new Decoration({
          x:0,
          y:0,
          image: bg1
        }),
        bg2Deco = new Decoration({
          x:0,
          y:0,
          image: bg2
        }),
        bg3Deco = new Decoration({
          x:0,
          y:0,
          image: bg3
        }),
        bg4Deco = new Decoration({
          x:0,
          y:0,
          image: bg4
        }),
        bg5Deco = new Decoration({
          x:0,
          y:0,
          image: bg5
        })
      ]
      scrollOffset = 0;
    }
  }
}


// function drawSplash(){
//   splash.onload = function(){
//     ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
//     ctx.drawImage(splash, 0, 0, ctx.canvas.width, ctx.canvas.height);
//   };
// }


function gameStart(){
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width, canvas.height)
    document.getElementById("btnStart").remove();
    player.draw();
    animate();
}


function animate(){ // Animate
  requestAnimationFrame(animate);
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,canvas.width, canvas.height)
 
  // decorations.forEach(Decoration =>{
  //   Decoration.draw();
  // });

  platforms.forEach(platform =>{
    platform.draw();
  });

  player.update();

  // Hold left/right for moving player
  if (keys.right.pressed && player.position.x < 400){
    player.velocity.x = 5
  } else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
    player.velocity.x = -5
  } else {
    player.velocity.x = 0
  
    if (keys.right.pressed){
      scrollOffset += 5;
      platforms.forEach(platform =>{
        platform.position.x -=5 
      });
      bg2Deco.position.x -= 3;
      bg3Deco.position.x -= 4;
      bg4Deco.position.x -= 5;
      bg5Deco.position.x -= 6;
    } else if (keys.left.pressed && scrollOffset > 0){
      scrollOffset -= 5;
      platforms.forEach(platform =>{
        platform.position.x +=5 
      });
      bg2Deco.position.x += 3;
      bg3Deco.position.x += 4;
      bg4Deco.position.x += 5;
      bg5Deco.position.x += 6;
    }
  }

  // Platform detection for player
  platforms.forEach(platform =>{
    if (player.position.y + player.height <= platform.position.y && player.position.y + player.height + player.velocity.y >= platform.position.y && player.position.x + player.width >= platform.position.x && player.position.x <= platform.position.x + platform.width) {
      player.velocity.y = 0;
    }
  });

//win condition
  if(scrollOffset > 5000){
    console.log("you win");
  }

//lose condition
  if (player.position.y > canvas.width){
    levels[level].init();
  };
}

document.body.addEventListener('keydown', keyDown);
document.body.addEventListener('keyup', keyUp);

function keyDown(event){
    if(event.code == "ArrowUp"){
        if(event.repeat){return}
        else player.velocity.y -= 10;
    }

    if(event.code == "ArrowLeft"){
      keys.left.pressed = true;
      player.currentSprite = player.sprites.run.left;
      player.currentCropWidth = player.sprites.run.cropWidth;
      player.currentCropHeight = player.sprites.run.cropHeight;
      player.currentFrameLimit = player.sprites.run.frameLimit;
    }

    if(event.code == "ArrowRight"){
      keys.right.pressed = true;
      player.currentSprite = player.sprites.run.right;
      player.currentCropWidth = player.sprites.run.cropWidth;
      player.currentCropHeight = player.sprites.run.cropHeight;
      player.currentFrameLimit = player.sprites.run.frameLimit;
    }
}

function keyUp(event){
  if(event.code == "ArrowUp"){
      player.velocity.y -= 5;
  }

  if(event.code == "ArrowLeft"){
    keys.left.pressed = false;
    player.currentSprite = player.sprites.idle.left;
    player.currentCropWidth = player.sprites.idle.cropWidth;
    player.currentCropHeight = player.sprites.idle.cropHeight;
    player.currentFrameLimit = player.sprites.idle.frameLimit;
  }

  if(event.code == "ArrowRight"){
    keys.right.pressed = false;
    player.currentSprite = player.sprites.idle.right;
    player.currentCropWidth = player.sprites.idle.cropWidth;
    player.currentCropHeight = player.sprites.idle.cropHeight;
    player.currentFrameLimit = player.sprites.idle.frameLimit;
  }
}
gameStart();