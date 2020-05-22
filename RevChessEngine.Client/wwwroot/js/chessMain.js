console.log("starting chessMain");
var board = null;
var game = new Chess();
var searchDepth = 2;

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

function makeBestMove() {
  game.move(findBestMove());
  board.position(game.fen());
}

function findBestMove() {
  let possibleMoves = game.moves();
  if(possibleMoves.length === 0)
    return;

  let bestMoveScore = -9999;
  let bestMove;
  possibleMoves.forEach(move => {
    game.move(move);
    let currentScore = minimax(searchDepth, game, true);
    if(currentScore > bestMoveScore) {
      bestMove = move;
      bestMoveScore = currentScore;
      console.log("best move: ", bestMove, "currentScore ", bestMoveScore);
    }
    game.undo();
  });

  if(bestMove === undefined) {
    console.log("Something went wrong. Executing default capture/random move.");
    makeBestCapture;
  } else {
    return bestMove;
  }
}

function minimax(depth, curGame, playerIsWhite) {
  if (depth === 0) {
    return boardEvaluation(curGame.board());
  }

  let possibleMoves = curGame.moves();
  if (playerIsWhite) {
    let bestMove = -9999;
    possibleMoves.forEach(move => {
      curGame.move(move);
      bestMove = Math.max(bestMove, minimax(depth - 1, curGame, !playerIsWhite));
      curGame.undo();
    });
    return bestMove;
  } else {
    let bestMove = 9999;
    possibleMoves.forEach(move => {
      curGame.move(move);
      bestMove = Math.min(bestMove, minimax(depth - 1, curGame, !playerIsWhite));
      curGame.undo();
    });
    return bestMove;
  }
}

function boardEvaluation(currentBoard) {
  let totalPieceVal = 0;
  currentBoard.forEach(positions => {
    positions.forEach(square => {
      totalPieceVal += getPieceValue(square);
    });
  });
  return totalPieceVal;
}

 /**
  * evaluateAllBoard {
  *   total piece val = 0;
  *   go through all the board {
  *     sum up all piece
  *   } 
  * }
  */

function makeBestCapture () {
  var possibleMoves = game.moves( { verbose: true })
  var possibleCaptures = [];

  // game over
  if (possibleMoves.length === 0) return

  possibleMoves.forEach(move => {
    if(move.flags == "c") {
      possibleCaptures.push(move);
    }
  });

  // default to random move if no captures available
  var bestCapture = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  var bestCaptureValue = 0;
  
  possibleCaptures.forEach(capture => {
    if(getPieceValue(game.get(capture.to)) < bestCaptureValue) {
      bestCaptureValue = getPieceValue(game.get(capture.to));
      bestCapture = capture;
    }
  });
  game.move(bestCapture);
  board.position(game.fen());
}

function getPieceValue(piece) {
  if (piece === null) {
    return 0;
  }
  var getValue = function (piece) {
    if (piece.type === 'p') {
        return 10;
    } else if (piece.type === 'r') {
        return 50;
    } else if (piece.type === 'n') {
        return 30;
    } else if (piece.type === 'b') {
        return 30 ;
    } else if (piece.type === 'q') {
        return 90;
    } else if (piece.type === 'k') {
        return 900;
    }
    throw "" + piece.type + " is not a valid piece type!";
  };
  //
  if(piece.color === 'w') {
    //bitwise operator to convert number to negative
    return ~getValue(piece) + 1;
  } else {
    return getValue(piece);
  }
}

function clickShowPositionBtn () {
  console.log('Current position as an Object:')
  console.log(board.position())

  console.log('Current position as a FEN string:')
  console.log(board.fen())
}


function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // make best legal move for black
  window.setTimeout(makeBestMove, 250)
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  pieceTheme: '../chessboard/img/chesspieces/wikipedia/{piece}.png',
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)

$('#showPositionBtn').on('click', clickShowPositionBtn)

$('#flipOrientationBtn').on('click', board.flip)