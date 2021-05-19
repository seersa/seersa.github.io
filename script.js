//Get canvas from html code
const canvas = document.getElementById('ourCanvas')

// allows you two draw 2d on the canvas
const c = canvas.getContext('2d')

// Size of the canvas
canvas.width = 1000
canvas.height = 700
groundHeight = canvas.height - 30

// Initalize a bird and tubes container
let tubes
let bird

// True if spacebar is pressed else false
let click = false

// True if game is over
let gameOver = false

// True if game is running
let pressedPlay = false

// Used to stop holding down jump
let isClickDown = false

//The score in the game
let score = 0
let savedScore = [1]

// id's to be able to call interval functions
let idIntervalAdd
let idIntervalRemove
let idTimeout

// id to be able to call requestAnimation
let myReq

// id's to be able to call eventhandler
let handler

// All the keys you can use to jump in here
var jumpKeys = ['Space', 'ArrowUp', 'KeyW']

// Class for creating tubes with holes.
class Tube {
    constructor(x, y, width, holeY, holeHeight, holeColor) {
        this.x = x
        this.y = y
        this.width = width
        this.color = this.makeGradient(this.width + 5)
        this.colorEnds = this.makeGradient(this.width + 15)
        this.holeY = holeY
        this.holeHeight = holeHeight
        this.holeColor = holeColor
    }

    draw() {
        c.save()
        // Draw the tubes with gradient
        c.fillStyle = this.color
        c.translate(this.x, this.y)
        c.fillRect(0, 0, this.width, canvas.height)
        c.lineWidth = 2
        c.strokeRect(1, -10, this.width - 3, canvas.height + 10)

        // Draw the ends of the tubes with gradient
        c.fillStyle = this.colorEnds
        c.fillRect(-5, this.holeY - 31, this.width + 10, 30)
        c.strokeRect(-5, this.holeY - 31, this.width + 10, 30)
        c.fillRect(-5, this.holeY + this.holeHeight + 1, this.width + 10, 30)
        c.strokeRect(-5, this.holeY + this.holeHeight + 1, this.width + 10, 30)

        // Draw the hole with background color
        c.fillStyle = "#69a3f5"
        c.fillRect(0, this.holeY, this.width, this.holeHeight)
        c.restore()
    }

    // Returns a gradient color used to draw tubes
    makeGradient(size) {
        let grd = c.createLinearGradient(-size + this.width, this.y, size, 0)
        grd.addColorStop(0, "#316e3c")
        grd.addColorStop(0.3, "#b8ffc1")
        grd.addColorStop(1, "#184a21")
        return grd
    }

    updatePos() {
        this.x -= 3
        this.draw()
    }
}

// Class to create the bird
class Bird {
    constructor() {
        this.x = 100
        this.y = 250
        this.speed = 0
        this.radius = 20
        this.color = 'yellow'
    }

    // Draws the dot according to coordinates
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    // Makes the downwards speed faster
    gravity() {
        this.speed += 0.15
    }

    // Make the bird go up
    flap() {
        this.speed = -5
        click = false
    }

    // Always pulls bird down with gravity changes changes the speed to be pos itive when space is pressed, then draws the bird at the new position
    updatePos() {

        // Adds collision between bird and roof
        if (this.y < this.radius) {
            this.y = this.radius
            this.speed = 0
        }

        this.gravity()

        if (click) {
            this.flap()
        }
        this.y += this.speed

        bird.draw()
    }

    resetBird() {
        this.x = 100
        this.y = 250
        this.speed = 0
        this.radius = 20
        this.color = 'yellow'
    }
}

// Spawn tubes continuously after 1.5sec
function spawnTubes() {
    idIntervalAdd = setInterval(() => {
        tubes.push(new Tube(canvas.width, 0, 75, Math.floor((Math.random() * 375) + 100), 150, 'white'))
    }, 1500)
    isTubesSpawning = true;
}

// Remove tubes when not in canvas
function removeTubes() {
    idTimeout = setTimeout(() => {
        idIntervalRemove = setInterval(() => {
            tubes.shift()
        }, 1500)
    }, 8000)
}

// Adds collisions between the bird, the tubes and the floor.
function collision() {

    // Ends game if the bird has hit the ground. 
    if (bird.y > groundHeight - bird.radius) {
        bird.y = groundHeight - bird.radius
        bird.speed = 0
        gameOver = true
    }

    tubes.forEach((tube) => {
        // Check if bird has same x coordinate as tube and adds score when that's true
        if (tube.x + tube.width > bird.x - bird.radius && tube.x < bird.x + bird.radius) {
            score++
            // Check if bird is not inside hole, ends game if it isn't.
            if (bird.y - bird.radius < tube.holeY || bird.y + bird.radius > tube.holeY + tube.holeHeight)
                gameOver = true
        }
    })
}

// Puts the score on the canvas
function drawScore() {
    c.beginPath()
    c.rect(0, 0, 120, 25)
    c.fillStyle = "rgba(0,0,0,0.2)"
    c.fill()
    c.stroke()
    c.font = "22px verdana"
    c.fillStyle = "#ffffff"
    if (Number.isInteger(score / 38)) {
        printedScore = score / 38 // Score is counted every frame so remove all the extra score
    }
    c.fillText("Score: " + printedScore, 10, 20)
}

// Stores an array of 10 best highscores localy on computer
function saveScore() {
    getSavedScore()
    savedScore.push(printedScore)
    for (let i = 0; i < savedScore.length; i++) {
        savedScore[i] = parseInt(savedScore[i],10)
    }
    console.log(savedScore)
    // Otherwise it is sorted lexicographicaly
    savedScore.sort(function(a,b){return a - b}).reverse()
    
    // Max length 10
    while (savedScore.length > 10) {
        savedScore.pop()
    }
    localStorage.setItem("score", savedScore)
}

// Get the savedScore array localy on computer
function getSavedScore() {
    if (savedScore.length > 0) {
        let retrievedSavedScore = localStorage.getItem("score")
        savedScore = retrievedSavedScore.split(",")
        console.log(retrievedSavedScore)
    }
}

// Collect highscore localy on computer and draw top 10
function drawHighscore() {
    c.fillStyle = "#e9f0ad"
    c.fillRect(canvas.width/2-300,0,580,canvas.height)
    c.strokeRect(canvas.width/2-300,0,580,canvas.height)

    //getSavedScore()
    c.font = "32px verdana"
    c.fillStyle = "#000000"
    c.fillText("Highscore",canvas.width/2-87, 40)
    for (let i = 0; i < savedScore.length; i++) {
        if (i != 9) {
            c.fillText(i+1 + ".  " + savedScore[i], canvas.width/2-60, i*65+85); 
        } else {
            c.fillText(i+1 + ".  " + savedScore[i], canvas.width/2-80, i*65+85); 
        }
        c.fillText("-----------------", canvas.width/2-130, (i+1)*65+40)
    }
}

// Draws the end screen
function drawGameOver() {
    c.beginPath()
    c.rect(240, 315, 550, 95)
    c.fillStyle = "#e9f0ad"
    c.fill()
    c.stroke()
    c.font = "32px verdana"
    c.fillStyle = "#000000"
    c.fillText("GAME OVER! Your Score was: " + printedScore, 250, 350)
    c.fillText("Press R to play again", 345, 400)
}

// Draws the backgorund
function drawBackground() {
    // Draw the sky
    c.fillStyle = "#69a3f5"
    c.fillRect(0, 0, canvas.width, groundHeight)
}

function drawGround() {
    // Draw the ground
    c.fillStyle = "#f2fcc0"
    c.fillRect(0, groundHeight, canvas.width, 30)

    c.fillStyle = "#316e3c"
    c.fillRect(0, groundHeight, canvas.width, 10)
}

function addImgHowToPlay() {
    let img = new Image()
    img.src = 'howToPlay.png'
    c.drawImage(img,0,0)
}

// Recursive function that clears the canvas and draws the tubes and birds at their new position
function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height)
    drawBackground()
    tubes.forEach((tube) => {
        tube.updatePos()
    })
    drawGround()
    bird.updatePos()

    collision()
    drawScore()

    // If collision has occured listen for input to clear the canvas and reset the game   
    if (!gameOver) {
        myReq = requestAnimationFrame(animate)
    } else {
        //saveScore()
        stopInterval()
        drawGameOver()
        stopAnimation()
        pressedPlay = false;
        handler = function (e) {
            if (e.code === 'KeyR') {
                resetCanvas()
            }
        }
        // Reset the canvas when key R is pressed down
        addEventListener('keydown', handler)
    }
}

// Stop calling the animation
function stopAnimation() {
    cancelAnimationFrame(myReq)
}

// Clear all interval functions
function stopInterval() {
    clearTimeout(idTimeout)
    clearInterval(idIntervalAdd)
    clearInterval(idIntervalRemove)
}

// Reset canvas
function resetCanvas() {
    if (!pressedPlay) {
        removeEventListener("keydown", handler)
        score = 0
        gameOver = false
        bird = new Bird()
        tubes = []
        runGame()
    }
}

// Start game
function runGame() {
    pressedPlay = true;
    spawnTubes()
    animate()
    removeTubes()
}

// This runs onload this page
function startScreen() {
    drawBackground()
    drawGround()
}

// If space is pressed down, flap 
addEventListener('keydown', function (e) {
    for (i = 0; i < jumpKeys.length; i++) {

        if (e.code === jumpKeys[i]) {
            // If space is already pressed down, don't flap again
            if (isClickDown == true) {
                return
            }
            isClickDown = true
            click = true
        }
    }
})

// If space is not pressed down, fall
addEventListener('keyup', function (e) {
    for (i = 0; i < jumpKeys.length; i++) {
        if (e.code === jumpKeys[i]) {
            click = false
            isClickDown = false
        }
    }
})