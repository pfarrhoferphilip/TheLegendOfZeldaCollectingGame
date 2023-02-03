/***********************************
 * INIT
 * **********************************/
let player = document.getElementById('player');
let door = document.getElementById('door');
let spriteImg = document.getElementById('spriteImg');
let surface = document.getElementById('surface');

let startButton = document.getElementById('startButton');
let debug_output = document.getElementById('debug_output');

let currentItem;
let currentPotion = null;
let potion_spawn_chance = 1000;
let current_potion_spawn_chance = potion_spawn_chance;
let potion_despawn_time = 5000;
let score = 0;
let scoreElement = document.getElementById("score");
let musicVolume = 0.2;
let soundVolume = 1;

var pickupAudio = new Audio('./audio/pickup.mp3');
var musicTracks = [new Audio('./audio/Kass.mp3'), new Audio('./audio/Hateno.mp3'), new Audio('./audio/Revali.mp3')]
var doorEnterAudio = new Audio('./audio/EnterDoor.wav');
var gameStartAudio = new Audio('./audio/GameStart.mp3');
let potionSpawnAudio = new Audio('./audio/spawn.mp3');
let potionDespawnAudio = new Audio('./audio/despawn.mp3');
var gangnam = new Audio('./audio/secretSound.mp3');
let currentTrack;

let timer_start_value = 30;
let current_timer_value;
let timer_element = document.getElementById("timer");
let is_game_over = false;
let door_is_entered = false;



// Scale the surface to 80% of the screen width
let surface_scale = 0.80 * (window.innerWidth / surface.clientWidth)
surface.style.transform = `scale(${surface_scale})`;
let black_panel = document.getElementById("blackPanel");



/***********************************
 * GAME CONFIG
 * **********************************/
let spriteImgNumber = 0; // current animation part of sprite image
let gameSpeed = 24; // game loop refresh rate (pictures per second)
let characterStartSpeed = 7;
let characterSpeed = characterStartSpeed; // move offset in PX



/***********************************
 * EVENT LISTENER
 * **********************************/
document.onkeydown = keydown_detected;
document.onkeyup = keyup_detected;

let leftArrow = false;
let rightArrow = false;
let upArrow = false;
let downArrow = false;
let fKey = false;

function keydown_detected(e) {
    //console.log(e);
    //console.log(e.keyCode);
    if (!e) {
        e = window.event; //Internet Explorer
    }
    if (e.keyCode == 37) { // leftArrow
        leftArrow = true;
    }
    if (e.keyCode == 38) { //upArrow
        upArrow = true;
    }
    if (e.keyCode == 39) { // rightArrow
        rightArrow = true;
    }
    if (e.keyCode == 40) { // downArrow
        downArrow = true;
    }
    //Only for development purposes
    if (e.keyCode == 70) { // F
        fKey = true;
    }
}
function keyup_detected(e) {
    //console.log(e);
    //console.log(e.keyCode);
    if (!e) {
        e = window.event; //Internet Explorer
    }
    if (e.keyCode == 37) { // leftArrow
        leftArrow = false;
    }
    if (e.keyCode == 38) { //upArrow
        upArrow = false;
    }
    if (e.keyCode == 39) { // rightArrow
        rightArrow = false;
    }
    if (e.keyCode == 40) { // downArrow
        downArrow = false;
    }
}



/***********************************
 * GAME LOOP
 * **********************************/
function startGame() {
    scoreElement.innerHTML = score;
    player.style.left = '290px'; // starting position
    player.style.top = '180px'; // starting position
    player.style.opacity = '1'; // show player
    spriteImg.style.right = '0px'; // starting animation

    startButton.innerHTML = 'STARTED';
    startButton.removeAttribute('onclick');
    gameStartAudio.play();

    startMusic();
    gameLoop();
}

function gameLoop() {

    if (!is_game_over) {
        if (player.offsetLeft >= 5) {
            if (leftArrow) {
                movePlayer((-1) * characterSpeed, 0, -1);
                animatePlayer();
            }
        }

        if (player.offsetLeft <= surface.clientWidth - 50) {
            if (rightArrow) {
                movePlayer(characterSpeed, 0, 1)
                animatePlayer();
            }
        }

        if (player.offsetTop >= 0) {
            if (upArrow) {
                movePlayer(0, (-1) * characterSpeed, 0);
                animatePlayer();
            }
        }

        if (player.offsetTop <= surface.clientHeight - 53) {
            if (downArrow) {
                movePlayer(0, characterSpeed, 0);
                animatePlayer();
            }
        }

        if (currentItem != null) {
            if (isColliding(player, currentItem)) {
                collectItem();
            }
        }

        if (isColliding(player, door)) {
            enterDoor();
        }

        if (currentPotion != null) {
            if (isColliding(player, currentPotion)) {
                collectPotion();
            }
        }

        //DEVKEY
        if (fKey == true) {
            characterSpeed = 15;
        }

        //Spawn Potion at random
        console.log(currentPotion);
        if (door_is_entered) {
            if (currentPotion == null) {
                if (getRandomNumber(current_potion_spawn_chance + 2) == current_potion_spawn_chance) {
                    spawnPotion(getRandomNumber(surface.clientWidth - 50), getRandomNumber(surface.clientHeight - 50));
                    current_potion_spawn_chance = potion_spawn_chance;
                } else if(current_potion_spawn_chance > 5){
                    current_potion_spawn_chance -= 5;
                }
            }
        }


        setTimeout(gameLoop, 1000 / gameSpeed); // async recursion   
    }
}

async function enterDoor() {
    if (!door_is_entered) {
        door_is_entered = true;
        characterSpeed = 0;
        door.remove();
        doorEnterAudio.play();
        black_panel.classList.add("blackPanelAnimation");
        setTimeout(function () {
            console.log("timeout 1");

            surface.style.backgroundImage = 'url(img/background2.png)';

            player.style.left = '200px';
            player.style.top = '50px';

            setTimeout(function () {
                console.log("timeout 2");
                document.getElementById("blackPanel").remove();

                spawnItem(getRandomNumber(surface.clientWidth - 50), getRandomNumber(surface.clientHeight - 50));
                current_timer_value = timer_start_value;
                characterSpeed = characterStartSpeed;
                countTimerDown();
            }, 1000)


        }, 1000);
    }

}

async function countTimerDown() {

    if (current_timer_value <= 0) {
        gameOver();
    } else {
        current_timer_value--;
        timer_element.innerHTML = current_timer_value;
        setTimeout(countTimerDown, 1000);
    }
}

function gameOver() {
    is_game_over = true;
    surface.innerHTML += `
    <div id="gameOverScreen">
        <h1 onclick="secretGangnamstyle()" style="color: red;">GAME OVER</h1>
        <div class="flex-center">
            <h1 id="restartButton" onclick="location.reload()">Restart</h1>
        </div>
    </div>
    `;
    player.opacity = 0;
    currentItem.opacity = 0;
}

function collectItem() {
    if (!is_game_over) {
        pickupAudio.pause;
        pickupAudio.currentTime = 0;
        pickupAudio.play();
        currentItem.remove();
        score++;
        scoreElement.innerHTML = score;
        spawnItem(getRandomNumber(surface.clientWidth - 50), getRandomNumber(surface.clientHeight - 50));
    }

}

function collectPotion() {
    if (!is_game_over) {
        currentPotion.remove();
        currentPotion = null;
        pickupAudio.pause;
        pickupAudio.currentTime = 0;
        pickupAudio.play();
        speedBuff(15, 5000)
    }

}

async function speedBuff(newSpeed, duration) {

    characterSpeed = newSpeed;
    setTimeout(function () {

        characterSpeed = characterStartSpeed;

    }, duration);

}

//Collectable Items
function spawnItem(posX, posY) {
    console.log(posX + posY);
    document.getElementById("itemHolder").innerHTML = `
    <div class="item" id="currentItem">
        <img src="img/item02.png">
    </div>
    `
    currentItem = document.getElementById("currentItem");
    console.log(currentItem);

    currentItem.style.right = posX + "px";
    currentItem.style.top = posY + "px";
}

//Potion Items
function spawnPotion(posX, posY) {

    console.log(posX + posY);
    potionSpawnAudio.play();
    document.getElementById("potionHolder").innerHTML = `
    <div class="item" id="currentPotion">
        <img src="img/speedPotion.png">
    </div>
    `
    currentPotion = document.getElementById("currentPotion");
    console.log(currentPotion);

    currentPotion.style.right = posX + "px";
    currentPotion.style.top = posY + "px";

    setTimeout(function() {

        if (currentPotion != null) {
            currentPotion.remove();
            potionDespawnAudio.play();
            currentPotion = null;
        }

    }, potion_despawn_time)
}

function getRandomNumber(max) {
    let randomNum = Math.floor(Math.random() * max);
    console.log(randomNum);
    return randomNum;
}



/***********************************
 * MOVE
 * **********************************/
/**
 * @param {number} dx - player x move offset in pixel
 * @param {number} dy - player y move offset in pixel
 * @param {number} dr - player heading direction (-1: move left || 1: move right || 0: no change)
 */
function movePlayer(dx, dy, dr) {

    if (!is_game_over) {
        // current position
        let x = parseFloat(player.style.left);
        let y = parseFloat(player.style.top);

        // calc new position
        x += dx;
        y += dy;

        // assign new position
        player.style.left = x + 'px';
        player.style.top = y + 'px';

        // handle direction
        if (dr != 0) {
            player.style.transform = `scaleX(${-dr})`;
        }

        // output in debugger box
        debug_output.innerHTML = `x: ${x} | y: ${y} | direction: ${dr} | animation: ${spriteImgNumber}`;
    }


}

function startMusic() {
    currentTrack = musicTracks[getRandomNumber(musicTracks.length)];
    currentTrack.play();
    currentTrack.loop = true;
    currentTrack.volume = musicVolume;
}



/***********************************
 * ANIMATE PLAYER
 * **********************************/
function animatePlayer() {

    if (spriteImgNumber < 9) { // switch to next sprite position
        spriteImgNumber++;
        let x = parseFloat(spriteImg.style.right);
        x += 45; // ANPASSEN!
        spriteImg.style.right = x + "px";
    }
    else { // animation loop finished: back to start animation
        spriteImg.style.right = "0px";
        spriteImgNumber = 0;
    }

}

function secretGangnamstyle() {
    document.getElementById("body").outerHTML = '<body class="secretClass"></body>';
    gangnam.play();
}