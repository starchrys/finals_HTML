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
  const bg1 = img('bg1.png');
  const bg2 = img('bg2.png');
  const bg3 = img('bg3.png');
  const bg4 = img('bg4.png');
  const bg5 = img('bg5.png');
  const lvl1 = img('level1.png');
  const lvl2 = img('level2.png');
  const lvl3 = img('level3.png');
  const healthbarFrame = img('healthBar.png')

//aud function to easily import audio
function aud(file) {
  const audio = new Audio();
  audio.src = 'sfx/' + file;
  return audio;
}

//declaring sfx
const bgmsfx = aud("BGM_QuietForest.mp3");
const gameoversfx = aud("GameOverFX_GoodNight.mp3");
const winsfx = aud("VictoryFX_Triumph.mp3");
const jumpsfx = aud("Jump.mp3");
const witch1sfx = aud("WitchSmallDeath.mp3");
const witch2sfx = aud("WitchTallDeath.mp3");

//Declaring variables
const gravity = 0.5; //Global Gravity
let playerIsAlive = true;
let playerLife = 100;

//variables and function for splash screen
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

class CollisionBlock {
  constructor({x, y, width, height}){
    this.position = {x, y}
    this.width = width
    this.height = height
  }
  draw(){
    ctx.fillStyle = 'rgba(255, 0, 0, 0)'
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class CollisionEnemy {
  constructor({x, y, width, height}){
    this.position = {x, y}
    this.width = width
    this.height = height
  }
  draw(){
    ctx.fillStyle = 'rgba(255, 0, 0, 0)'
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class CollisionEnemyAttack {
  constructor({x, y, width, height}){
    this.position = {x, y}
    this.width = width
    this.height = height
  }
  draw(){
    ctx.fillStyle = 'rgba(255, 0, 0, 0)'
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}
    

class Player {
  constructor({x, y,
    collisionBlocks = [],
    collisionEnemies = [],
    collisionEnemyAttacks = []
  }){ // Player Position/Width/Height
    this.position = {
      x,
      y
    }
    this.velocity = {  // Player Gravity
      x: 0,
      y: 0
    }

    this.isAttacking;
    this.width = 300;
    this.height = 192;
    this.state = PlayerStates.R_idle;
    this.#createAnimations();
    this.collisionBlocks = collisionBlocks;
    this.collisionEnemies = collisionEnemies;
    this.collisionEnemyAttacks = collisionEnemyAttacks;
    this.onPlatform = false;
    
    }
    draw(ctx){
      const animation = this.animations.find((animation) => animation.isFor(this.state))
      const image = animation.getImage();
      if(this.state == PlayerStates.L_attack){
        ctx.drawImage(image, this.position.x - 100, this.position.y, this.width, this.height);
      } else ctx.drawImage(image, this.position.x, this.position.y, this.width, this.height);
      
    }

    #createAnimations(){
      this.RidleAnimation = new SpriteAnimation("idle_right (?).png",6, 7,PlayerStates.R_idle);
      this.LidleAnimation = new SpriteAnimation("idle_left (?).png",6, 7,PlayerStates.L_idle);
      this.RattackAnimation = new SpriteAnimation("attack_right (?).png",4, 5,PlayerStates.R_attack);
      this.LattackAnimation = new SpriteAnimation("attack_left (?).png",4, 5,PlayerStates.L_attack);
      this.RrunAnimation = new SpriteAnimation("run_right (?).png",8, 7,PlayerStates.R_run);
      this.LrunAnimation = new SpriteAnimation("run_left (?).png",8, 7,PlayerStates.L_run);
      this.deathAnimation = new SpriteAnimation("death (?).png",6, 7,PlayerStates.death, true);
    
      this.animations = [
        this.RidleAnimation,
        this.LidleAnimation,
        this.RattackAnimation,
        this.LattackAnimation,
        this.RrunAnimation,
        this.LrunAnimation,
        this.deathAnimation
      ]
    }

    update(ctx){ 
      this.draw(ctx);
      this.position.x += this.velocity.x;

      //hitbox update for horizontal
      this.hitbox = {
        position: {
          x: this.position.x +56,
          y: this.position.y +64
        },
        width: 96,
        height: 128
      }
      
      this.attackBox = {
        position: this.hitbox.position,
        width: 200 ,
        height: 100,
      }

       //attackbox
       if (this.isAttacking){
       ctx.fillStyle = 'rgba(0,0,0,0)'
       if(this.state == PlayerStates.L_attack){
        ctx.fillRect(this.attackBox.position.x-105, this.attackBox.position.y, this.attackBox.width, this.attackBox.height)
       } else ctx.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height)
       
       }

      //check for horizontal block collisions
      for (let i =0; i <this.collisionBlocks.length; i++){
        const collisionBlock = this.collisionBlocks[i]
        if (this.hitbox.position.x <= collisionBlock.position.x + collisionBlock.width && 
          this.hitbox.position.x + this.hitbox.width >= collisionBlock.position.x && 
          this.hitbox.position.y + this.hitbox.height >= collisionBlock.position.y && 
          this.hitbox.position.y <= collisionBlock.position.y + collisionBlock.height){
          if (this.velocity.x < 0 || keys.left.pressed) {
            const offset = this.hitbox.position.x - this.position.x
            this.position.x = collisionBlock.position.x + collisionBlock.width - offset +0.01
            break
          }
          if (this.velocity.x > 0 ||  keys.right.pressed) {
            const offset = this.hitbox.position.x - this.position.x + this.hitbox.width
            this.position.x = collisionBlock.position.x - offset - 0.01
            break
          }
        }
      }
      this.position.y += this.velocity.y;
      
      //hitbox update for vertical
      this.hitbox = {
        position: {
          x: this.position.x +56,
          y: this.position.y +64
        },
        width: 96,
        height: 128
      }
      //check for vertical block collisions
      for (let i =0; i <this.collisionBlocks.length; i++){
        const collisionBlock = this.collisionBlocks[i]
        if (this.hitbox.position.x <= collisionBlock.position.x + collisionBlock.width &&
          this.hitbox.position.x + this.hitbox.width >= collisionBlock.position.x && 
          this.hitbox.position.y + this.hitbox.height >= collisionBlock.position.y && 
          this.hitbox.position.y <= collisionBlock.position.y + collisionBlock.height){
          this.onPlatform = true;
          if (this.velocity.y < 0) {
            this.velocity.y = 0
            const offset = this.hitbox.position.y - this.position.y
            this.position.y = collisionBlock.position.y + collisionBlock.height - offset +0.01
            break
          }
          if (this.velocity.y > 0) {
            this.velocity.y = 0
            const offset = this.hitbox.position.y - this.position.y + this.hitbox.height
            this.position.y = collisionBlock.position.y - offset - 0.01
            break
          }
        } else this.onPlatform = false;
      }

      for (let i =0; i <this.collisionEnemyAttacks.length; i++){
        const collisionEnemyAttack = this.collisionEnemyAttacks[i]
        if (this.hitbox.position.x <= collisionEnemyAttack.position.x + collisionEnemyAttack.width && 
          this.hitbox.position.x + this.hitbox.width >= collisionEnemyAttack.position.x && 
          this.hitbox.position.y + this.hitbox.height >= collisionEnemyAttack.position.y && 
          this.hitbox.position.y <= collisionEnemyAttack.position.y + collisionEnemyAttack.height){
            if (playerLife > 0){
              if (level == 1){
                if (scrollOffset > 1055 && scrollOffset < 2090){
                  let rwitch1 = rwitch[0]
                  if(rwitch1.imageIndex >= 21 && rwitch1.imageIndex < 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 2090 && scrollOffset < 2915){
                  let bwitch1 = bwitch[0]
                  if(bwitch1.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 2915 && scrollOffset < 3700){
                  let bwitch1 = bwitch[1]
                  if(bwitch1.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 3700){
                  let meryll1 = meryll[0]
                  if(meryll1.imageIndex >= 23 && meryll1.imageIndex < 25){
                    playerLife = playerLife - 1.5;
                  }
                }
              }
              if (level == 2){
                if (scrollOffset > 1455 && scrollOffset < 2030){
                  let meryll1 = meryll[0]
                  if(meryll1.imageIndex >= 23 && meryll1.imageIndex < 25){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 2030 && scrollOffset < 2565){
                  let bwitch1 = bwitch[0]
                  if(bwitch1.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 3180 && scrollOffset < 4000){
                  let bwitch2 = bwitch[1]
                  if(bwitch2.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 4000 && scrollOffset < 5115){
                  let meryll2 = meryll[1]
                  if(meryll2.imageIndex >= 23 && meryll2.imageIndex < 25){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 5115 && scrollOffset < 5875){
                  let rwitch1 = rwitch[0]
                  if(rwitch1.imageIndex >= 21 && rwitch1.imageIndex < 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 5875 && scrollOffset < 6610){
                  let bwitch3 = bwitch[2]
                  if(bwitch3.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
              }
              if (level == 3){
                if (scrollOffset > 810 && scrollOffset < 1190){
                  let bwitch1 = bwitch[0]
                  if(bwitch1.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 1200 && scrollOffset < 1915){
                  let meryll1 = meryll[0]
                  if(meryll1.imageIndex >= 23 && meryll1.imageIndex < 25){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 1915 && scrollOffset < 2760){
                  let rwitch1 = rwitch[0]
                  if(rwitch1.imageIndex >= 21 && rwitch1.imageIndex < 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 3240 && scrollOffset < 3850){
                  let bwitch2 = bwitch[1]
                  if(bwitch2.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 3850 && scrollOffset < 4610){
                  let meryll2 = meryll[1]
                  if(meryll2.imageIndex >= 23 && meryll2.imageIndex < 25){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 4900 && scrollOffset < 5765){
                  let rwitch2 = rwitch[1]
                  if(rwitch2.imageIndex >= 21 && rwitch2.imageIndex < 24){
                    playerLife = playerLife - 1.5;
                  }
                }
                if (scrollOffset > 5765 && scrollOffset < 6675){
                  let bwitch3 = bwitch[2]
                  if(bwitch3.imageIndex >= 24){
                    playerLife = playerLife - 1.5;
                  }
                }
              }
            } else playerDeath();
        }
      }
      for (let i =0; i <this.collisionEnemies.length; i++){
        const collisionEnemy = this.collisionEnemies[i]
        if (this.attackBox.position.x <= collisionEnemy.position.x + collisionEnemy.width && 
          this.attackBox.position.x + this.attackBox.width >= collisionEnemy.position.x && 
          this.attackBox.position.y + this.attackBox.height >= collisionEnemy.position.y && 
          this.attackBox.position.y <= collisionEnemy.position.y + collisionEnemy.height && this.isAttacking){
            player.isAttacking = false
            if (level == 1 ){
              if(scrollOffset > 1055 && scrollOffset < 2090){
                let rwitch1 = rwitch[0]              
                rwitch1.state = EnemyStates.R_death;
                witch1sfx.play();
              }
              if (scrollOffset > 2090 && scrollOffset < 2915){
                let bwitch1 = bwitch[0]                
                bwitch1.state = EnemyStates.B_death;
                witch2sfx.play();
              } 
              if (scrollOffset> 2915 && scrollOffset < 3700){
                let bwitch2 = bwitch[1]
                bwitch2.state = EnemyStates.B_death;
                witch2sfx.play();
              }
              if (scrollOffset> 3700){ 
                let meryll1 = meryll[0]
                meryll1.state = EnemyStates.M_death;
                witch1sfx.play();
              }
            }
            if (level == 2){
              if (scrollOffset > 1455 && scrollOffset < 2030){
                let meryll1 = meryll[0]
                meryll1.state = EnemyStates.M_death;
                witch1sfx.play();
              }
              if (scrollOffset > 2030 && scrollOffset < 2565){
                let bwitch1 = bwitch[0]                
                bwitch1.state = EnemyStates.B_death;
                witch2sfx.play();
              }
              if (scrollOffset > 3180 && scrollOffset < 4000){
                let bwitch2 = bwitch[1]
                bwitch2.state = EnemyStates.B_death;
                witch2sfx.play();
              }
              if (scrollOffset > 4000 && scrollOffset < 5115){
                let meryll2 = meryll[1]
                meryll2.state = EnemyStates.M_death;
                witch1sfx.play();
              }
              if (scrollOffset > 5115 && scrollOffset < 5875){
                let rwitch1 = rwitch[0]
                rwitch1.state = EnemyStates.R_death;
                witch1sfx.play();
              }
              if (scrollOffset > 5875 && scrollOffset < 6610){
                let bwitch3 = bwitch[2]
                bwitch3.state = EnemyStates.B_death;
                witch2sfx.play();
              }
            }
            if (level == 3){
              if (scrollOffset > 810 && scrollOffset < 1190){
                let bwitch1 = bwitch[0]
                bwitch1.state = EnemyStates.B_death;
                witch2sfx.play();
              }
              if (scrollOffset > 1200 && scrollOffset < 1915){
                let meryll1 = meryll[0]
                meryll1.state = EnemyStates.M_death;
                witch1sfx.play();
              }
              if (scrollOffset > 1915 && scrollOffset < 2760){
                let rwitch1 = rwitch[0]
                rwitch1.state = EnemyStates.R_death;
                witch1sfx.play();
              }
              if (scrollOffset > 3240 && scrollOffset < 3850){
                let bwitch2 = bwitch[1]
                bwitch2.state = EnemyStates.B_death;
                witch2sfx.play();
              }
              if (scrollOffset > 3850 && scrollOffset < 4610){
                let meryll2 = meryll[1]
                meryll2.state = EnemyStates.M_death;
                witch1sfx.play();
              }
              if (scrollOffset > 4900 && scrollOffset < 5765){
                let rwitch2 = rwitch[1]
                rwitch2.state = EnemyStates.R_death;
                witch1sfx.play();
              }
              if (scrollOffset > 5765 && scrollOffset < 6675){
                let bwitch3 = bwitch[2]
                bwitch3.state = EnemyStates.B_death;
                witch2sfx.play();
              }
            }
        }
      }
      
      // Gravity to Player
      if (this.position.y + this.height +  this.velocity.y <= canvas.height)
        this.velocity.y += gravity;
    }

    attack(){
      this.isAttacking = true;
      setTimeout(() => {
        this.isAttacking = false
      }, 100)
    }
  }

//Animations for enemies
const EnemyStates = {
  B_idle: "idle",
  R_idle: "idle",
  M_idle: "idle",
  R_attack: "attack",
  R_death: "death",
  B_death: "death",
  B_attack: "attack",
  M_death: "death",
  M_attack: "attack"
}
//Animations for player
const PlayerStates = {
  R_idle: "Ridle",
  L_idle: "Lidle",
  R_attack: "Rattack",
  L_attack: "Lattack",
  R_run: "Rrun",
  L_run: "Lrun",
  death: "death"
}

//Animations for screens
const VictoryStates = {
  victory: "victory"
}

const GameOverStates = {
  gameOver: "gameOver"
}

class SpriteAnimation {
  images = [];
  timerCount = 0;
  timerCountDefault = 0;
  imageIndex = 0;
  state = "";
  stopAtEnd = false;

  constructor(fileNameTemplate, numberOfImages, timerCount, state, stopAtEnd) {
  for (let i = 1; i <= numberOfImages; i++) {
  const image = img(fileNameTemplate.replace("?", i));
  this.images.push(image);
  }
  this.timerCount = timerCount;
  this.timerCountDefault = timerCount;
  this.state = state;
  this.stopAtEnd = stopAtEnd;
  }

  isFor(state) {
  return this.state === state;
  }

  reset() {
  this.imageIndex = 0;
  this.timerCount = this.timerCountDefault;
   }

  getImage() {
  this.timerCount--;
  if (this.timerCount <= 0 && !this.shouldStop()) {
  this.timerCount = this.timerCountDefault;
  this.imageIndex++;
  if (this.imageIndex >= this.images.length) {
    this.imageIndex = 0;
  }
  }
  return this.images[this.imageIndex];
  }

  getImageIndex() {
  return this.imageIndex;
   }

  shouldStop() {
  return this.stopAtEnd && this.imageIndex === this.images.length - 1;
   }
  }


//Enemy classes
class BWitch {
  constructor({x, y}){
    this.position = {
      x,
      y
    }
    this.state = EnemyStates.B_idle;
    this.#createAnimations();
  }
  draw(ctx){
    const animation = this.animations.find((animation) => animation.isFor(this.state))
    const image = animation.getImage();
    this.imageIndex = animation.getImageIndex();
    ctx.drawImage(image, this.position.x, this.position.y);
  }

  #createAnimations(){
    this.idleAnimation = new SpriteAnimation("BWitch_idle (?).png",27, 6,EnemyStates.R_idle);
    this.deathAnimation = new SpriteAnimation("BWitch_death (?).png",9, 6,EnemyStates.R_death, true);
    
    this.animations = [
      this.idleAnimation,
      this.deathAnimation
    ]
  }
}

class RWitch {
  constructor({x, y}){
    this.position = {
      x,
      y
    }
    this.state = EnemyStates.R_idle
    this.#createAnimations();
  }
  draw(ctx){
    const animation = this.animations.find((animation) => animation.isFor(this.state))
    const image = animation.getImage();
    this.imageIndex = animation.getImageIndex();
    ctx.drawImage(image, this.position.x, this.position.y);
  }

  #createAnimations(){
    this.idleAnimation = new SpriteAnimation("RWitch_idle (?).png",25, 6,EnemyStates.R_idle);
    this.deathAnimation = new SpriteAnimation("RWitch_death (?).png",7, 6,EnemyStates.R_death, true);
    
    this.animations = [
      this.idleAnimation,
      this.deathAnimation
    ]
  }
}

class Meryll {
  constructor({x, y}){
    this.position = {
      x,
      y
    }
    this.state = EnemyStates.M_idle;
    this.#createAnimations();
  }
  draw(ctx){
    const animation = this.animations.find((animation) => animation.isFor(this.state))
    const image = animation.getImage();
    this.imageIndex = animation.getImageIndex();
    ctx.drawImage(image, this.position.x, this.position.y);
  }

  #createAnimations(){
    this.idleAnimation = new SpriteAnimation("Meryll_idle (?).png",25, 6,EnemyStates.R_idle);
    this.deathAnimation = new SpriteAnimation("MWitch_death (?).png",7, 6,EnemyStates.R_death, true);
    
    this.animations = [
      this.idleAnimation,
      this.deathAnimation
    ]
  }
}

//Classes for screens
class Victory{
  constructor() {
    this.state = VictoryStates.victory;
    this.#createAnimations();
  }

  draw(ctx){
      const image = this.victoryAnimation.getImage();
      ctx.drawImage(image, 0, 0, 1680, 945);
  }

  #createAnimations(){
    this.victoryAnimation = new SpriteAnimation("victory (?).png",25, 8,VictoryStates.victory, true);
  }
}

class GameOver{
  constructor() {
    this.state = GameOverStates.gameOver;
    this.#createAnimations();
  }

  draw(ctx){
      const image = this.gameOverAnimation.getImage();
      ctx.drawImage(image, 0, 0, 1680, 945);
  }

  #createAnimations(){
    this.gameOverAnimation = new SpriteAnimation("gameOver (?).png",21, 7,GameOverStates.gameOver, true);
  }
}

//Background and platform claasses
class Background {
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

class levelPlats {
  constructor({x, y, image, width, height}) {
    this.position = {
      x,
      y
    }

    this.width = width
    this.height = height
    this.image = image
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y)
  }
}

//Class for healthBar
class healthBar {
  constructor({width}) {
    this.width = width
  }

  draw() {
    if(playerLife > 0){
    var HPgradient=ctx.createLinearGradient(645, 32, 645, 55);
    HPgradient.addColorStop(0, "#e43b44")
    HPgradient.addColorStop(0.5, "#e43b44");
    HPgradient.addColorStop(1, "#9e2835");
    ctx.fillStyle = HPgradient;
    ctx.fillRect(709, 32, this.width, 40);
    ctx.drawImage(healthbarFrame, 645, 32, 364, 40)
    }
  }
}

//Declaring level variables
let collisionEnemyAttacks = []
let collisionBlocks = []
let collisionEnemies = []
let bwitch = []
let rwitch = []
let meryll = []
let victory = []
let gameOver = []
let lvlplat = []
let player = new Player({x:100, y:667, collisionBlocks, collisionEnemies, collisionEnemyAttacks});

//Declaring backgrounds
let bgs = [
  new Background({
    x:0,
    y:0,
    image: bg1
  }),
  bg2Deco = new Background({
    x:0,
    y:0,
    image: bg2
  }),
  bg3Deco = new Background({
    x:0,
    y:0,
    image: bg3
  }),
  bg4Deco = new Background({
    x:0,
    y:0,
    image: bg4
  }),
  bg5Deco = new Background({
    x:0,
    y:0,
    image: bg5
  })
]

//keys pressed setter
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
      bg2Deco.position.x = 0;
      bg3Deco.position.x = 0;
      bg4Deco.position.x = 0;
      bg5Deco.position.x = 0;
      collisionBlocks = []
      collisionEnemies = []
      collisionEnemyAttacks = []            
      bwitch = []
      rwitch = []
      meryll = []   
      lvlplat = [new levelPlats({
        x: 0,
        y: 0,
        image: lvl1,
        width: 7200,
        height: 945
      })]
      
      collisionBlocks = [new CollisionBlock({
        x:0,
        y:811,
        width: 2402,
        height: 133
      }),
      new CollisionBlock({
        x:880,
        y:724,
        width: 318,
        height: 90
      }),
      new CollisionBlock({
        x:1377,
        y:662,
        width: 323,
        height: 156
      })]
      lvl1plats();
      player = new Player({x:100, y:667,collisionBlocks, collisionEnemies, collisionEnemyAttacks});
      scrollOffset = 0
    }
  },
  2: {
    init: () => {
      bg2Deco.position.x = 0;
      bg3Deco.position.x = 0;
      bg4Deco.position.x = 0;
      bg5Deco.position.x = 0;
      collisionBlocks = []
      collisionEnemies = []
      collisionEnemyAttacks = []       
      player = new Player({x:100, y:667,collisionBlocks, collisionEnemies, collisionEnemyAttacks});
      
      bwitch = []
      rwitch = []
      meryll = []
      
      lvlplat = [new levelPlats({
        x: 0,
        y: 0,
        image: lvl2,
        width: 8000,
        height: 945
      })]
      
      lvl2plats();
      collisionBlocks.push(new CollisionBlock({
        x:0,
        y:822,
        width: 687,
        height: 125
      }),
      new CollisionBlock({
        x:963,
        y:687,
        width: 1873,
        height: 260
      }),
      new CollisionBlock({
        x:1277,
        y:475,
        width: 1264,
        height: 45
      }),
      )
      scrollOffset = 0
    }
  },
  3: {
    init: () => {
      bg2Deco.position.x = 0;
      bg3Deco.position.x = 0;
      bg4Deco.position.x = 0;
      bg5Deco.position.x = 0;
      collisionBlocks = []
      collisionEnemies = []
      collisionEnemyAttacks = []      
      player = new Player({x:100, y:667,collisionBlocks, collisionEnemies, collisionEnemyAttacks});
      
      bwitch = []
      rwitch = []
      meryll = []
      
      lvlplat = [new levelPlats({
        x: 0,
        y: 0,
        image: lvl3,
        width: 9800,
        height: 945
      })]
      bwitch.push(new BWitch({
        x:1446,
        y:196
      }))
      collisionEnemies.push (new CollisionEnemy({
        x:1578,
        y:206,
        width: 132,
        height: 226
      }))
      collisionEnemyAttacks.push(new CollisionEnemyAttack({
        x: 1446,
        y: 206,
        width: 132,
        height: 270,
      }))
      collisionBlocks.push(new CollisionBlock({
        x:0,
        y:814,
        width: 386,
        height: 130
      })),
      collisionBlocks.push(new CollisionBlock({
        x:557,
        y:814,
        width: 159,
        height: 131
      })),
      collisionBlocks.push(new CollisionBlock({
        x:888,
        y:814,
        width: 159,
        height: 131
      })),
      collisionBlocks.push(new CollisionBlock({
        x:1216,
        y:814,
        width: 159,
        height: 131
      })),
      collisionBlocks.push(new CollisionBlock({
        x:1547,
        y:814,
        width: 159,
        height: 131
      })),
      collisionBlocks.push(new CollisionBlock({
        x:1296,
        y:431,
        width: 467,
        height: 67
      })),
      lvl3plats();
      scrollOffset = 0
    }
  },
  4: {
    init: () => {
      collisionBlocks = []
      collisionEnemies = []
      collisionEnemyAttacks = []            
      bwitch = []
      rwitch = []
      meryll = []
      lvlplat = []
      playerLife = 0;
      player = new Player({x:-300, y:667,collisionBlocks, collisionEnemies, collisionEnemyAttacks});
      collisionBlocks.push(new CollisionBlock({
        x:-300,
        y:767,
        width: 200,
        height: 130
      }))
      bgmsfx.pause();
      winsfx.play();
      victory = [(new Victory({}))]
      canvas.addEventListener('click', clickedRestart);
      
    }
  },
  5: {
    init: () => {
      collisionBlocks = []
      collisionEnemies = []
      collisionEnemyAttacks = []            
      bwitch = []
      rwitch = []
      meryll = []
      lvlplat = []
      player = new Player({x:-300, y:667,collisionBlocks, collisionEnemies, collisionEnemyAttacks});
      collisionBlocks.push(new CollisionBlock({
        x:-300,
        y:767,
        width: 200,
        height: 130
      }))
      bgmsfx.pause();
      gameoversfx.play();
      gameOver = [(new GameOver({}))]
      canvas.addEventListener('click', clickedRestart);
    }
  }
}

//Scroll offset-triggered collision blocks and enemies
function lvl1plats(){
  if (level == 1){
  requestAnimationFrame(lvl1plats);}
  
  if (scrollOffset == 495 && rwitch.length === 0){
    collisionEnemies.push (new CollisionEnemy({
      x:1680,
      y:637,
      width: 86,
      height: 192
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1310,
      y: 637,
      width: 370,
      height: 121,
    }))
    rwitch.push(new RWitch({
      x:1298,
      y:630
    }))
  }
  if (scrollOffset == 1320 && bwitch.length === 0){
    bwitch.push(new BWitch({
      x:1674,
      y:170
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1806,
      y:180,
      width: 132,
      height: 226
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1674,
      y: 180,
      width: 132,
      height: 270,
    }))
  }
  if (scrollOffset == 2110 && bwitch.length === 1){
    bwitch.push(new BWitch({
      x:1604,
      y:580
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1736,
      y:590,
      width: 132,
      height: 226
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1604,
      y: 590,
      width: 132,
      height: 270,
    }))
  }
  if (scrollOffset == 3435 && meryll.length === 0){
    meryll.push(new Meryll({
      x:1400,
      y:230
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1775,
      y:230,
      width: 141,
      height: 223
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1400,
      y: 250,
      width: 375,
      height: 148,
    }))
  }
  if (scrollOffset == 1740){
    collisionBlocks.push(new CollisionBlock({
      x:821,
      y:818,
      width: 600,
      height: 127
    }),
    new CollisionBlock({
      x:1185,
      y:409,
      width: 385,
      height: 90
    }),
    new CollisionBlock({
      x:1629,
      y:819,
      width: 600,
      height: 127
    }))
  }
  if (scrollOffset == 2975){
    collisionBlocks.push(new CollisionBlock({
      x: 670,
      y: 435,
      width: 385,
      height: 90
    }),
    new CollisionBlock({
      x: 1172,
      y: 818,
      width: 3054,
      height: 127
    }))
  }
  if (scrollOffset == 3740){
    collisionBlocks.push(new CollisionBlock({
      x: 879,
      y: 724,
      width: 709,
      height: 96
    }),
    new CollisionBlock({
      x: 1024,
      y: 627,
      width: 556,
      height: 96
    }),
    new CollisionBlock({
      x: 1167,
      y: 532,
      width: 421,
      height: 95
    }),
    new CollisionBlock({
      x: 1318,
      y: 437,
      width: 270,
      height: 96
    }))
  }
  if (scrollOffset == 4330){
    collisionBlocks.push(new CollisionBlock({
      x: 1271,
      y: 280,
      width: 385,
      height: 90
    }))
  }
  if (scrollOffset == 5435){
    collisionBlocks.push(new CollisionBlock({
      x:663,
      y:0,
      width: 50,
      height: 945
    }))
  }
}

function lvl2plats(){
  if (level == 2){
  requestAnimationFrame(lvl2plats);}
  if (scrollOffset == 540 && meryll.length === 0){
    meryll.push(new Meryll({
      x:1241,
      y:257,
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1616,
      y:257,
      width: 141,
      height: 223
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1241,
      y: 277,
      width: 375,
      height: 148,
    }))
  }
  if (scrollOffset == 880 && bwitch.length === 0){
    bwitch.push(new BWitch({
      x:1664,
      y:450
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1796,
      y:460,
      width: 132,
      height: 226
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1664,
      y: 460,
      width: 132,
      height: 270,
    }))
  }
  if (scrollOffset == 2380 && bwitch.length === 1){
    bwitch.push(new BWitch({
      x:1622,
      y:400
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1754,
      y:410,
      width: 132,
      height: 226
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1622,
      y: 410,
      width: 132,
      height: 270,
    }))
  }
  if (scrollOffset == 3135 && meryll.length === 1){
    meryll.push(new Meryll({
      x:1562,
      y:338,
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1937,
      y:338,
      width: 141,
      height: 223
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1562,
      y: 358,
      width: 375,
      height: 148,
    }))
  }
  if (scrollOffset == 4635 && rwitch.length === 0){
    rwitch.push(new RWitch({
      x:1193,
      y:572,
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1575,
      y:579,
      width: 86,
      height: 192
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1205,
      y: 579,
      width: 370,
      height: 121,
    }))
  }
  if (scrollOffset == 5095 && bwitch.length === 2){
    bwitch.push(new BWitch({
      x:1667,
      y:83
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1799,
      y:93,
      width: 132,
      height: 226
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1667,
      y: 93,
      width: 132,
      height: 270,
    }))
  }
  if (scrollOffset == 2135){
    collisionBlocks.push(new CollisionBlock({
      x:869,
      y:549,
      width: 421,
      height: 76
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1354,
      y:446,
      width: 421,
      height: 76
    }))
  }
  if (scrollOffset == 3130){
    collisionBlocks.push(new CollisionBlock({
      x:718,
      y:634,
      width: 470,
      height: 76
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1348,
      y:563,
      width: 729,
      height: 385
    }))
}
  if (scrollOffset == 4495){
    collisionBlocks.push(new CollisionBlock({
      x:1066,
      y:767,
      width: 1311,
      height: 178
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1350,
      y:382,
      width: 566,
      height: 82
    }))
  }
  if (scrollOffset == 5150){
    collisionBlocks.push(new CollisionBlock({
      x:1180,
      y:650,
      width: 679,
      height: 118
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1485,
      y:317,
      width: 566,
      height: 81
    }))
  }
  if (scrollOffset == 6135){
    collisionBlocks.push(new CollisionBlock({
      x:1191,
      y:690,
      width: 286,
      height: 256
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1320,
      y:197,
      width: 566,
      height: 82
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1477,
      y:817,
      width: 1588,
      height: 128
    }))
  }
    if (scrollOffset == 7235){
      collisionBlocks.push(new CollisionBlock({
        x:963,
        y:0,
        width: 50,
        height: 945
      }))
    }
  
}

function lvl3plats(){
  if (level == 3){
  requestAnimationFrame(lvl3plats);}
  if (scrollOffset == 415 && meryll.length === 0){
    meryll.push(new Meryll({
      x:1406,
      y:514,
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1781,
      y:514,
      width: 141,
      height: 223
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1406,
      y: 534,
      width: 375,
      height: 148,
    }))
  }
  if (scrollOffset == 1095 && rwitch.length === 0){
    rwitch.push(new RWitch({
      x:1450,
      y:627,
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1832,
      y:634,
      width: 86,
      height: 192
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1462,
      y: 634,
      width: 370,
      height: 121,
    }))
  }
  if (scrollOffset == 2350 && bwitch.length === 1){
    bwitch.push(new BWitch({
      x:1552,
      y:309
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1684,
      y:319,
      width: 132,
      height: 226
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1552,
      y: 319,
      width: 132,
      height: 270,
    }))
  }
  if (scrollOffset == 2805 && meryll.length === 1){
    meryll.push(new Meryll({
      x:1609,
      y:592,
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1984,
      y:592,
      width: 141,
      height: 223
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1609,
      y: 612,
      width: 375,
      height: 148,
    }))
  }
  if (scrollOffset == 3830 && rwitch.length === 1){
    rwitch.push(new RWitch({
      x:1634,
      y:452,
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:2016,
      y:459,
      width: 86,
      height: 192
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1646,
      y: 459,
      width: 370,
      height: 121,
    }))
  }
  if (scrollOffset == 4820 && bwitch.length === 2){
    bwitch.push(new BWitch({
      x:1616,
      y:392
    }))
    collisionEnemies.push (new CollisionEnemy({
      x:1748,
      y:402,
      width: 132,
      height: 226
    }))
    collisionEnemyAttacks.push(new CollisionEnemyAttack({
      x: 1616,
      y: 402,
      width: 132,
      height: 270,
    }))
  }
  if (scrollOffset == 1085){
    collisionBlocks.push(new CollisionBlock({
      x:773,
      y:721,
      width: 467,
      height: 67
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1438,
      y:816,
      width: 557,
      height: 129
    }))
  }
  if (scrollOffset == 2180){
    collisionBlocks.push(new CollisionBlock({
      x:1036,
      y:704,
      width: 345,
      height: 168
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1518,
      y:538,
      width: 456,
      height: 168
    }))
  }
  if (scrollOffset == 3465){
    collisionBlocks.push(new CollisionBlock({
      x:879,
      y:818,
      width: 557,
      height: 127
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1592,
      y:702,
      width: 159,
      height: 170
    }))
  }
  if (scrollOffset == 3995){
    collisionBlocks.push(new CollisionBlock({
      x:1383,
      y:641,
      width: 562,
      height: 305
    }))
  }
  if (scrollOffset == 5410){
    collisionBlocks.push(new CollisionBlock({
      x:803,
      y:643,
      width: 1124,
      height: 302
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1306,
      y:542,
      width: 621,
      height: 101
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1433,
      y:447,
      width: 494,
      height: 96
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1559,
      y:352,
      width: 368,
      height: 95
    }))
  }
  if (scrollOffset == 6235){
    collisionBlocks.push(new CollisionBlock({
      x:867,
      y:256,
      width: 236,
      height: 96
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1412,
      y:237,
      width: 456,
      height: 168
    })),
    collisionBlocks.push(new CollisionBlock({
      x:1298,
      y:819,
      width: 2268,
      height: 125
    }))
  }
  if (scrollOffset == 6690){
    collisionBlocks.push(new CollisionBlock({
      x:1567,
      y:539,
      width: 159,
      height: 170
    }))
  }
  if (scrollOffset == 7825){
    collisionBlocks.push(new CollisionBlock({
      x:763,
      y:0,
      width: 50,
      height: 945
    }))
  }
}

//Game Over conditions
function playerDeath(){
  playerIsAlive = false;
  player.state = PlayerStates.death
  level = 5;
  setTimeout(()=> {
    levels[level].init();
  },1000);
}

// Restart game function for Game over and Victory screen
function clickedRestart(event){
    let game = event;
    if(game){
      ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height);
      location.reload();
    }
}

function drawSplash(){
  splash.onload = function(){
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(splash, 0, 0, ctx.canvas.width, ctx.canvas.height);
  };
}

function gameStart(){
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width, canvas.height)
    document.getElementById("btnStart").remove();
    player.draw(ctx);
    levels[level].init();
    bgmsfx.play();
    bgmsfx.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
    animate();
}

function animate(){
  requestAnimationFrame(animate);
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,canvas.width, canvas.height)

  //Drawing classes
  bgs.forEach(Background =>{
    Background.draw();
  });
  lvlplat.forEach(levelPlats =>{
    levelPlats.draw();
   });
  victory.forEach(Victory =>{
      Victory.draw(ctx);
    });
  gameOver.forEach(GameOver =>{
    GameOver.draw(ctx);
  });
  player.update(ctx);  
  bwitch.forEach(Bwitch =>{
    Bwitch.draw(ctx);
  });
  rwitch.forEach(Rwitch =>{
    Rwitch.draw(ctx);
  });
  meryll.forEach(Meryll =>{
    Meryll.draw(ctx);
  });
  collisionEnemies.forEach(CollisionEnemy =>{
    CollisionEnemy.draw();
   });
   collisionBlocks.forEach(CollisionBlock =>{
    CollisionBlock.draw();
   });
   collisionEnemyAttacks.forEach(CollisionEnemyAttack =>{
    CollisionEnemyAttack.draw()
   });

   //Drawing HealthBar
   let healthbar = new healthBar({
    width: playerLife*3
  })
   healthbar.draw();
   
  // Hold left/right for moving player
  if (keys.right.pressed && player.position.x < 400 && playerIsAlive){
    player.velocity.x = 5
  } else if ((keys.left.pressed && player.position.x > 100 && playerIsAlive) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0 && playerIsAlive)) {
    player.velocity.x = -5
  } else {
    player.velocity.x = 0
  
    if (keys.right.pressed && playerIsAlive){
      scrollOffset += 5;
      lvlplat.forEach(levelPlats =>{
        levelPlats.position.x -=5
      });
      bwitch.forEach(Bwitch =>{
        Bwitch.position.x -=5 
      });
      rwitch.forEach(Rwitch =>{
        Rwitch.position.x -=5 
      });
      meryll.forEach(Meryll =>{
        Meryll.position.x -=5 
      });
      collisionBlocks.forEach(CollisionBlock =>{
        CollisionBlock.position.x -=5
       });
       collisionEnemies.forEach(CollisionEnemy =>{
        CollisionEnemy.position.x -=5
       });
       collisionEnemyAttacks.forEach(CollisionEnemyAttack =>{
        CollisionEnemyAttack.position.x -=5
       });
      bg2Deco.position.x -= 1;
      bg3Deco.position.x -= 2;
      bg4Deco.position.x -= 3;
      bg5Deco.position.x -= 4;
    } else if (keys.left.pressed && scrollOffset > 0 && playerIsAlive){
      scrollOffset -= 5;
      lvlplat.forEach(levelPlats =>{
        levelPlats.position.x +=5
      });
      bwitch.forEach(Bwitch =>{
        Bwitch.position.x +=5 
      });
      rwitch.forEach(Rwitch =>{
        Rwitch.position.x +=5 
      });
      meryll.forEach(Meryll =>{
        Meryll.position.x +=5 
      });
      collisionBlocks.forEach(CollisionBlock =>{
        CollisionBlock.position.x +=5
       });
      collisionEnemies.forEach(CollisionEnemy =>{
        CollisionEnemy.position.x +=5
       });
       collisionEnemyAttacks.forEach(CollisionEnemyAttack =>{
        CollisionEnemyAttack.position.x +=5
       });
      bg2Deco.position.x += 1;
      bg3Deco.position.x += 2;
      bg4Deco.position.x += 3;
      bg5Deco.position.x += 4;
    }
  }

//Condition for falling in holes
  if (player.position.y > canvas.width){
    if (playerLife > 20){
      playerLife = playerLife - 20;
      levels[level].init();
    }else {
      playerDeath();
      playerLife = 0;
    }
  };
}

//Event listeners for keyboard
document.body.addEventListener('keydown', keyDown);
document.body.addEventListener('keyup', keyUp);

function keyDown(event){
    if(event.code == "ArrowUp" && playerIsAlive && player.onPlatform){
        if(event.repeat){return}
        else player.velocity.y -= 21;
        jumpsfx.play();
        //Next level conditons
        if (level == 1){
          if(scrollOffset >= 5000 && player.position.y == 87.99){
          level++;
          setTimeout(()=> {
          levels[level].init();
          },500);
          }
        }
        if (level == 2){
          if(scrollOffset >= 7000 && player.position.y == 4.99){
          level++;
          setTimeout(()=> {
          levels[level].init();
          },500);
        }
      }
      if (level == 3){
        if(scrollOffset >= 7200 && player.position.y == 44.99){
        level++;
        setTimeout(()=> {
        levels[level].init();
        },500);
      }
    }
    }

    if(event.code == "ArrowLeft" && playerIsAlive){
      keys.left.pressed = true;
      player.state = PlayerStates.L_run;
    }

    if(event.code == "ArrowRight" && playerIsAlive){
      keys.right.pressed = true;
      player.state = PlayerStates.R_run;
    }
    if(event.code == "Space" && playerIsAlive && (player.state == PlayerStates.R_idle || player.state == PlayerStates.R_run)){
      player.state = PlayerStates.R_attack;
      player.attack();}
    if(event.code == "Space" && playerIsAlive && (player.state == PlayerStates.L_idle || player.state == PlayerStates.L_run)){
      player.state = PlayerStates.L_attack;
      player.attack();}
}

function keyUp(event){
  if(event.code == "ArrowLeft" && playerIsAlive){
    keys.left.pressed = false;
    player.state = PlayerStates.L_idle;
  }

  if(event.code == "ArrowRight" && playerIsAlive){
    keys.right.pressed = false;
    player.state = PlayerStates.R_idle;
  }

  if(event.code == "Space" && playerIsAlive && player.state == PlayerStates.R_attack){
    player.state = PlayerStates.R_idle;
    player.RattackAnimation.imageIndex = 0;
  }
  if(event.code == "Space" && playerIsAlive && player.state == PlayerStates.L_attack){
    player.state = PlayerStates.L_idle;
    player.LattackAnimation.imageIndex = 0;
  }
}

drawSplash();