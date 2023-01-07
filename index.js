const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.width=720;
canvas.height=405;

//img function to easily import images
function img(file){
    const image = new Image();
    image.src = 'sprites/' +file;
    return image;
}

//initializing of variables
const splash = img("splash.gif")

function gameStart(){
    console.log("Start kunwari");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,720,405);
    document.getElementById("btnStart").style.zIndex = "19";
}

