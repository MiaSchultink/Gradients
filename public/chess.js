

function createScreen(rows, columns) {
    const screen = document.createElement("table")
    screen.className = "board"
    for (let i = 0; i < rows; i++) {
        const row = screen.insertRow()
        for (let j = 0; j < columns; j++) {
            const cell = row.insertCell()
            cell.className = "cell"

            if ((i % 2) == 0) {
                if (j % 2 == 0) {
                    cell.style.backgroundColor = "white"
                }
                else {
                    cell.style.backgroundColor = "brown"
                }
            }
            else {
                if (j % 2 == 0) {
                    cell.style.backgroundColor = "brown"
                }
                else {
                    cell.style.backgroundColor = "white"
                }

            }
            cell.id = makeLabel(i, j)
        }
    }
    document.body.appendChild(screen)
}
function getIndex(label){
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
    const columnLabel = label.substr(0, 1)
    const columnIndex = letters.indexOf(columnLabel)
    const rowIndex = 8 - parseInt(label.substr(1, 1), 10)
    result = {
        rowIndex: rowIndex,
        columnIndex: columnIndex
    }
    return result; 
}
function makeLabel(row, column) {
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
    const letter = letters[column]
    const number = String(8 - row)
    const label = letter + number
    return label

}

function makeBoard() {
    function makePiece(type, color) {
        const piece = {
            type: type,
            color: color
        }
        return piece
    }
    function makeField(row, column) {

        const field = {
            piece: makePiece(null, null),
            label: makeLabel(row, column)
        }
        return field

    }
    const board = []
    for (let rowNumber = 0; rowNumber < 8; rowNumber++) {
        const row = []
        board.push(row)
        for (let columnNumber = 0; columnNumber < 8; columnNumber++) {
            row.push(makeField(rowNumber, columnNumber))
        }
    }
    return board
}

function initBoard(board) {

    function initRow(pieces, rowIndex, board, color) {
        const row = board[rowIndex]
        for (let piecePlace = 0; piecePlace < pieces.length; piecePlace++) {
            const piece = pieces[piecePlace]
            row[piecePlace].piece = {
                type: piece,
                color: color
            }
        }
        board[rowIndex] = row
        return board
    }

    const firstRowPieces = ["R", "N", "B", "K", "Q", "B", "N", "R"]
    const secondRowPieces = ["P", "P", "P", "P", "P", "P", "P", "P"]
    board = initRow(firstRowPieces, 0, board, "black")
    board = initRow(secondRowPieces, 1, board, "black")
    board = initRow(firstRowPieces, 7, board, "white")
    board = initRow(secondRowPieces, 6, board, "white")
    console.log(board)
    return board
}

function displayBoard(board) {

    function findPieceHtml(type, color, pieces) {
        const piece = pieces.filter(el => { return el.type == type })[0]
        if (color == 'white') {
            return piece.whiteHtml
        }
        else {
            return piece.blackHtml
        }
    }

    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        const row = board[rowIndex]
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const cell = row[cellIndex]
            const id = makeLabel(rowIndex, cellIndex)
            const boardCell = document.getElementById(id)
            if (cell.piece.type) {
                const pieceHtml = findPieceHtml(cell.piece.type, cell.piece.color, pieces)
                if (pieceHtml) {
                    boardCell.innerHTML = pieceHtml
                }
            }
            else {
                boardCell.innerHTML = ''
            }
        }
    }
}

function move(labelFrom, labelTo) {
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
    const indeces = getIndex(labelFrom)
    const colmnFromIndex = indeces.columnIndex
    const rowFromIndex = indeces.rowIndex
    const piece = board[rowFromIndex][colmnFromIndex].piece
    board[rowFromIndex][colmnFromIndex].piece = {
        type: null,
        color: null
    }
    const colmnTo = labelTo.substr(0, 1)
    const colmnToIndex = letters.indexOf(colmnTo)
    const rowToIndex = 8 - parseInt(labelTo.substr(1, 1), 10)
    board[rowToIndex][colmnToIndex].piece = piece
}

function ranodmBetween(a, b) {
    let number = Math.floor(Math.random() * (b - a + 1)) + a
    return number

}

function decideMove(color) {
    function checkBorder(row, colmn) {
        let result = false
        if (row >= 1 && row <= 8) {
            result = true
        }
        return result
    }
    function checkPiece(toLabel){
       
    }

    const piecesMove = []
    for (const row of board) {
        for (const cell of row) {
            if (cell.piece.type == "P" && cell.piece.color == color) {
                piecesMove.push(cell)
            }
        }
    }

    const randomIndex = ranodmBetween(0, piecesMove.length - 1)
    const labelFrom = piecesMove[randomIndex].label
    const fromRow = parseInt(labelFrom.substr(1, 1), 10)
    const fromColmn = labelFrom.substr(0, 1)
    let toRow;
    let toLabel;
    let move;
    if (color == 'white') {
        toRow = fromRow + 1
    }
    else {
        toRow = fromRow - 1
    }
    if (checkBorder(toRow, null)) {
        toLabel = fromColmn + String(toRow)
        move = {
            fromLabel: labelFrom,
            toLabel: toLabel,
        }

    }
    return move;
}
function newGame() {
    board = makeBoard()
    board = initBoard(board)
    displayBoard(board)
}

function nextMove(color) {
    const result = decideMove(color)
    if (result) {
        console.log(result)
        move(result.fromLabel, result.toLabel)
        displayBoard(board)
    }
}

function whiteMove() {
    nextMove('white')
}
function blackMove() {
    nextMove('black')
}

const pieces = [
    {
        type: "N",
        whiteHtml: `<i class="far fa-chess-knight-alt"></i>`,
        blackHtml: `<i class="fas fa-chess-knight-alt"></i>`,
        points: 3
    },
    {
        type: "R",
        whiteHtml: `<i class="far fa-chess-rook-alt"></i>`,
        blackHtml: `<i class="fas fa-chess-rook-alt"></i>`,
        points: 5
    },
    {
        type: "P",
        whiteHtml: `<i class="far fa-chess-pawn-alt"></i>`,
        blackHtml: `<i class="fas fa-chess-pawn-alt"></i>`,
        points: 1
    },
    {
        type: "B",
        whiteHtml: `<i class="far fa-chess-bishop-alt"></i>`,
        blackHtml: `<i class="fas fa-chess-bishop-alt"></i>`,
        points: 3
    },
    {
        type: "K",
        whiteHtml: `<i class="far fa-chess-king-alt"></i>`,
        blackHtml: `<i class="fas fa-chess-king-alt"></i>`,
        points: 1000000
    },
    {
        type: "Q",
        whiteHtml: `<i class="far fa-chess-queen-alt"></i>`,
        blackHtml: `<i class="fas fa-chess-queen-alt"></i>`,
        points: 10
    }
]

const _rows = 8;
const _columns = 8;
createScreen(_columns, _rows)
let board
newGame()