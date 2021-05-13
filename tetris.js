const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
document.getElementById("restart-button").addEventListener("click", (e) => {
	setGameOver()
});


const PIECES = [
    [Z,"blue"],
    [S,"yellow"],
    [T,"red"],
    [O,"cyan"],
    [L,"magenta"],
    [I,"lime"],
    [J,"orange"]
];		

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 30;
const VACANT = "BLACK"; // color of an empty square

let board = [];

let score = 0;
let highScore = 0;


// generate random pieces

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();
let nextPiece = randomPiece();

function saveData() {
	const data = JSON.stringify({
		score: score,
		highScore: highScore,
		board: board,
		activePiece: p
	});
	localStorage.tetwisData = data;
	return data;
}

setInterval(()=>{saveData()}, 500)

function loadData() {
	let data = {
		score: 0,
		highScore: 0,
		board: [],
		activePiece: p
	}
	if(localStorage.tetwisData) {
		data = JSON.parse(localStorage.tetwisData);
	}
	board = data.board;
	score = data.score;
	scoreElement.innerHTML = score;
	highScore = data.highScore;
	highScoreElement.innerHTML = highScore;
	console.log(data.activePiece)
	if (data.activePiece) {
		p = new Piece(data.activePiece.tetromino, data.activePiece.color, data.activePiece.x, data.activePiece.y);
	}
	console.log(p)
}

loadData();

function setScore(scoreToSet) {
	score = scoreToSet;
	if (score > highScore) {
		highScore = score;
		highScoreElement.innerHTML = highScore == 69 ? highScore + " (nice)" : highScore;
	}
	scoreElement.innerHTML = score == 69 ? score + " (nice)" : score;
}

function setGameOver() {
	gameOver = true;
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	setScore(0);
	p = nextPiece;
	nextPiece = randomPiece();
	board = [];
	makeBoard();
	drawBoard();
	gameOver= false;
	drop();
}

// draw a square
function drawSquare(x,y,color){
	
	
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
	
	

    //ctx.strokeStyle = "BLACK";
	//ctx.lineWidth = 0.1;
    //ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// create the board
function makeBoard(){
	//console.log(board);
	for( r = 0; r <ROW; r++){
		board[r] = [];
		for(c = 0; c < COL; c++){
			board[r][c] = VACANT;
		}
	}
}
if (board.length  < 1){
	makeBoard();
}



// draw the board
function drawBoard(){
	//console.log(board);
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
			drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

// The Object Piece

function Piece(tetromino,color,x=3,y=-2){
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // we need to control the pieces
    this.x = x;
    this.y = y;
}
// fill function

Piece.prototype.fill = function(color){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we draw only occupied squares
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

// draw a piece to the board

Piece.prototype.draw = function(){
    this.fill(this.color);
}

// undraw a piece


Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// Drop a the piece to the bottom
Piece.prototype.drop = function(){
	this.unDraw();
	let looping = !this.collision(0,1,this.activeTetromino);
    while (looping){
        this.y++;
		looping = !this.collision(0,1,this.activeTetromino)
    }
	this.draw();
    // we lock the piece and generate a new one
    this.lock();
    p = nextPiece;
	nextPiece = randomPiece();
}

// move Down the piece

Piece.prototype.moveDown = function(){
	setScore(score + 1);
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // we lock the piece and generate a new one
        this.lock();
        p = nextPiece;
		nextPiece = randomPiece();
    }
    
}

// Drop the piece

Piece.prototype.drop = function(){
	let willCollide = this.collision(0,1,this.activeTetromino)
	this.unDraw();
	while (!willCollide){
        this.y++;
		willCollide = this.collision(0,1,this.activeTetromino)
    }
	this.draw();
	this.lock();
    p = nextPiece;
	nextPiece = randomPiece();
    
}


// move Right the piece
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 3){
                //alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            // increment the score
            setScore(score+10);
        }
    }
	
    // update the board
    drawBoard();
}

// collision fucntion

Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece alrady in place
            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// CONTROL the piece

let activeKeys = {
	"ArrowLeft": {
		pressed: false,
		//lastPressed: Number.MAX_SAFE_INTEGER
	},
	"ArrowUp": {
		pressed: false,
		//lastPressed: Number.MAX_SAFE_INTEGER
	},
	"ArrowRight": {
		pressed: false,
		//lastPressed: Number.MAX_SAFE_INTEGER
	},
	"ArrowDown": {
		pressed: false,
		//lastPressed: Number.MAX_SAFE_INTEGER
	},
	" ": {
		pressed: false,
		//lastPressed: Number.MAX_SAFE_INTEGER
	}
}

const keys = new Map();

//document.getElementById("debug-button").addEventListener("click", (e) => {
	console.log(keys);
//})

window.addEventListener("keydown",handleKeyEvent);
window.addEventListener("keyup",handleKeyEvent);

function handleKeyEvent(event){
	const key = event.key.toLowerCase();
	const keydown = event.type == "keydown";
	
	keys.set(key, keydown ? true : false);
	//console.log(event)
    if(event.key == "ArrowLeft"){
		activeKeys["ArrowLeft"].pressed = keydown ? true : false;
		//activeKeys["ArrowLeft"].lastPressed = Date.now();
        //p.moveLeft();
        //dropStart = Date.now();
    }else if(event.key == "ArrowUp"){
		activeKeys["ArrowUp"].pressed = keydown ? true : false;
		//activeKeys["ArrowUp"].lastPressed = Date.now();
        //p.rotate();
        //dropStart = Date.now();
    }else if(event.key == "ArrowRight"){
		activeKeys["ArrowRight"].pressed = keydown ? true : false;
		//activeKeys["ArrowRight"].lastPressed = Date.now();
        //p.moveRight();
        //dropStart = Date.now();
    }else if(event.key == "ArrowDown"){
		activeKeys["ArrowDown"].pressed = keydown ? true : false;
		//activeKeys["ArrowDown"].lastPressed = Date.now();
        //p.moveDown();
		//setScore(score + 1);
		//dropStart = Date.now();
    }else if (event.key == " ") { // Space
		activeKeys[" "].pressed = keydown ? true : false;
		//activeKeys[" "].lastPressed = Date.now();
		//p.drop();
		//setScore(score + 25);
	}
}

// drop the piece every 0.3sec
let dropStart = Date.now();
let movementStart = Date.now();
let rotationStart = Date.now();
let spaceKeyStart = Date.now();
let gameOver = false;
function drop(){
	
    let now = Date.now();
    let delta = now - dropStart;
	let movementDela = now - movementStart;
	let roatationDelta = now - rotationStart;
	let spaceKeyDelta = now - spaceKeyStart;
	
	if (movementDela > 65) { // TODO: Put something here
		if (activeKeys["ArrowLeft"].pressed/* && (activeKeys["ArrowLeft"].lastPressed - now) > 2*/) {
			console.log("AL");
			p.moveLeft();
		}
		if (activeKeys["ArrowRight"].pressed/* && (activeKeys["ArrowRight"].lastPressed - now) > 2*/) {
			console.log("AR");
			p.moveRight();
		}
		if (activeKeys["ArrowDown"].pressed/* && (activeKeys["ArrowDown"].lastPressed - now) > 2*/) {
			console.log("AD");
			setScore(score + 1);
			p.moveDown();
		}
		movementStart = Date.now();
	}
	
	if (roatationDelta > 150) {
		if (activeKeys["ArrowUp"].pressed/* && (activeKeys["ArrowUp"].lastPressed - now) > 2*/) {
			console.log("AU");
			p.rotate();
		}
		rotationStart = Date.now();
	}
	if (spaceKeyDelta > 200) {
		if (activeKeys[" "].pressed/* && (activeKeys[" "].lastPressed - now) > 20*/) {
			console.log("SP");
			p.drop();
			spaceKeyStart = Date.now();
		}
	}
    if(delta > 300){
        p.moveDown();
        dropStart = Date.now();
    }
    if(gameOver){
        setGameOver();
    } else {
		requestAnimationFrame(drop);
	}
}

drop();

