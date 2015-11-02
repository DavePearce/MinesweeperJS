//Copyright (c) 2015, David J. Pearce
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//* Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//
//* Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation
//  and/or other materials provided with the distribution.
//
//* Neither the name of MinesweeperJS nor the names of its
//  contributors may be used to endorse or promote products derived from
//  this software without specific prior written permission.
//
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
//FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
//DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
//CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
//OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
//OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/**
 * The kind of hidden squares on the game board which are empty (i.e. don't
 * contain a bomb).
 */
var HIDDEN_EMPTY_SQUARE = 0;

/**
 * The kind of hidden squares on the game board which contain a bomb.
 */
var HIDDEN_BOMB_SQUARE = 1;

/**
 * The kind of flagged (hidden) squares on the game board.
 */
var HIDDEN_FLAGGED_SQUARE = 2;

/**
 * The kind of uncovered (empty) squares on the game board
 */
var UNCOVERED_EMPTY_SQUARE = 3;

/**
 * The kind of uncovered squares which contain bombs on the game board
 */
var UNCOVERED_BOMB_SQUARE = 4;

/**
 * The kinds for uncovered squares with X adjacent bomb(s).
 */
var UNCOVERED_ONE_SQUARE = 5;
var UNCOVERED_TWO_SQUARE = 6;
var UNCOVERED_THREE_SQUARE = 7;
var UNCOVERED_FOUR_SQUARE = 8;
var UNCOVERED_FIVE_SQUARE = 9;
var UNCOVERED_SIX_SQUARE = 10;
var UNCOVERED_SEVEN_SQUARE = 11;
var UNCOVERED_EIGHT_SQUARE = 12;

/**
 * The tag IDs associated with each kind of square 
 */
var IMAGE_IDS = [
    "hiddenSquare",
    "hiddenSquare",
    "flaggedSquare",
    "bombSquare",
    "uncoveredSquare",
    "uncoveredSquareOne",
    "uncoveredSquareTwo",
    "uncoveredSquareThree",
    "uncoveredSquareFour",
    "uncoveredSquareFive",
    "uncoveredSquareSix",
    "uncoveredSquareSeven",
    "uncoveredSquareEight"    
];

/**
 * Draw an image making up part of a square on the board using "game
 * coordinates". That is, board positions rather than pixel positions. This
 * means x=1,y=1 is the square at board location 1,1.
 */
function drawSquare(context, board, kind, x, y) {
	var imageID = IMAGE_IDS[kind];		
	var img = document.getElementById(imageID);
	x = x * board.squareSize;
	y = y * board.squareSize;				
	context.drawImage(img,x,y);
}

/**
 * Draw a given Game Board using a given graphics context.
 */
function drawGameBoard(context, board) {
	for (var x = 0; x < board.width; x = x + 1) {
		for (var y = 0; y < board.height; y = y + 1) {
			var index = x + (y*board.width);
			drawSquare(context, board, board.squares[index], x, y);
		}
	}
}

/**
 * Uncover a square on the board. This will reveal what is underneath the square
 * and may end the game (if a bomb is revealed). Furthermore, if the square is
 * empty then it will calculate the number of bombs in the surrounding area.
 * 
 * @param board
 * @param x
 * @param y
 */
function uncoverSquare(board, x, y) {	
	var index = x + (y*board.width);
	switch(board.squares[index]) {
	case HIDDEN_EMPTY_SQUARE:
		exposeSquare(board, x, y);		
		break;
	case HIDDEN_BOMB_SQUARE:
		var index = x + (y*board.width);
		board.squares[index] = UNCOVERED_BOMB_SQUARE;
		break;
	default:
		// do nothing
	}
}

/**
 * Expose a given square and recursively expose any adjacent and empty squares.
 * The expose process first calculates the number of bombs in the surrounding
 * area.
 * 
 * @param board
 * @param x
 * @param y
 */
function exposeSquare(board, x, y) {
	var bombs = countSurroundingBombs(board,x,y);
	var index = x + (y*board.width);
	board.squares[index] = UNCOVERED_EMPTY_SQUARE+bombs;
	exposeSurroundingSquares(board,x,y);
}

function exposeSurroundingSquares(board, x, y) {
	var minX = Math.max(x-1,0);
	var maxX = Math.min(x+1,board.width-1);
	var minY = Math.max(y-1,0);
	var maxY = Math.min(y+1,board.height-1);
	for(var i=minX;i<=maxX;i=i+1) {
		for(var j=minY;j<=maxY;j=j+1) {
			if(i != x || j != y) {
				var index = i + (j*board.width);
				if(board.squares[index] == HIDDEN_EMPTY_SQUARE) {
					exposeSquare(board,i,j);
				}
			}
		}	
	}
}

function countSurroundingBombs(board, x, y) {
	var minX = Math.max(x-1,0);
	var maxX = Math.min(x+1,board.width-1);
	var minY = Math.max(y-1,0);
	var maxY = Math.min(y+1,board.height-1);
	var bombs = 0;
	for(var i=minX;i<=maxX;i=i+1) {
		for(var j=minY;j<=maxY;j=j+1) {
			if(i != x || j != y) {
				var index = i + (j*board.width);
				if(board.squares[index] == HIDDEN_BOMB_SQUARE) {
					bombs = bombs + 1;
				}
			}
		}	
	}
	return bombs;
}

/**
 * Flag a square on the board. This will prevent this square from being
 * accidentally uncovered.
 * 
 * @param board
 * @param x
 * @param y
 */
function flagSquare(board, x, y) {
	var index = x + (y*board.width);
	board.squares[index] = HIDDEN_FLAGGED_SQUARE;
}

/**
 * Initialise empty game board of a given width and height. Width and height
 * measure the number of squares, *not* the number of pixels. Each square on the
 * board is initially hidden.
 * 
 * @param width
 * @param height
 * @returns
 */
function initGameBoard(nBombs, width,height,squareSize) {
	var squares = [];
	// First, create enough empty squares
	for (var i = 0; i < (width*height); i = i + 1) {
		squares.push(HIDDEN_EMPTY_SQUARE);
	}
	// Second, add enough bombs!
	for (var i = 0; i < squares.length; i = i + 1) {
		var count = Math.random() * (squares.length-i);
		if(count < nBombs) {
			squares[i] = HIDDEN_BOMB_SQUARE;
			nBombs = nBombs-1;
		}
	}
	return {
		squares: squares,		
		width: width,   // Width of board (in squares)
		height: height, // Height of board (in squares)
		squareSize: squareSize // Width/Height of a square (in pixels)
	};
}

/**
 * Initialise a given canvas element to represent the game board. This includes
 * attaching an appropriate event listener to intercept mouse clicks on the
 * board, etc.
 * 
 * @param canvasID
 * @param width
 * @param height
 * @param squareSize
 */
function initMinesweeperCanvas(canvasID,nBombs,width,height,squareSize) {
	var canvas = document.getElementById(canvasID);
	var context = canvas.getContext("2d");
	// Initialise the game board
	var board = initGameBoard(nBombs,width,height,squareSize);
	// Draw the initial board
	drawGameBoard(context,board);
	// Setup the left- and right-click events.
	canvas.addEventListener("mousedown", function(event) {
    	var x = Math.floor((event.pageX - canvas.offsetLeft) / squareSize);
        var y = Math.floor((event.pageY - canvas.offsetTop) / squareSize);        
        if(event.button == 0) {
        	// Handle left-click
        	uncoverSquare(board,x,y);
        } else {
        	// Handle right-click
        	flagSquare(board,x,y);        	
        }
        drawGameBoard(context,board);
    },false);
}
