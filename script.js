const X_CLASS = "x";
const HEART_CLASS = "heart";
const STORAGE_KEY = "saved-words";

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const form = document.getElementById("inputForm");
const inputElements = document.querySelectorAll("[data-cell-value]");
const clearBtn = document.getElementById("clearButton");

const cellElements = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");
const winningMessageElement = document.getElementById("winningMessage");
const winningMessageTextElement = document.querySelector(
  "[data-winning-message-text]"
);
const restartBtn = document.getElementById("restartButton");

let heartTurn;
let wordsArr;

startGame();

restartBtn.addEventListener("click", startGame);
form.addEventListener("submit", handleDoneBtnClick);
clearBtn.addEventListener("click", handleClear);

function startGame() {
  heartTurn = false;
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(HEART_CLASS);
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });
  setBoardHoverClass();
  winningMessageElement.classList.remove("show");

  const isStorage = loadStorage();

  if (isStorage && isStorage.length !== 0) {
    wordsArr = loadStorage();
    fillInputs(wordsArr);
    fillCells(wordsArr);
  } else {
    wordsArr = [];
  }
}

function loadStorage() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    return serializedState === null ? undefined : JSON.parse(serializedState);
  } catch (error) {
    console.error("Get state error: ", error.message);
  }
}

function saveStorage(value) {
  try {
    const serializedState = JSON.stringify(value);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Set state error: ", error.message);
  }
}

function fillInputs(arr) {
  inputElements.forEach((input, index) => {
    input.value = arr[index];
  });
}

function fillCells(arr) {
  cellElements.forEach((cell, index) => {
    cell.textContent = "";
    cell.textContent = arr[index];
  });
}

function handleDoneBtnClick(event) {
  event.preventDefault();
  wordsArr = [];
  inputElements.forEach((input) => {
    wordsArr.push(input.value);
  });
  fillCells(wordsArr);
  saveStorage(wordsArr);
}

function handleClear() {
  form.reset();
  cellElements.forEach((cell) => {
    cell.textContent = "";
  });
  wordsArr = [];
  saveStorage(wordsArr);
}

function handleClick(event) {
  const cell = event.target;
  const currentClass = heartTurn ? HEART_CLASS : X_CLASS;
  placeMark(cell, currentClass);

  if (checkWin(currentClass)) {
    endGame(false);
  } else if (isDraw()) {
    endGame(true);
  } else {
    swapTurns();
    setBoardHoverClass();
  }
}

function endGame(draw) {
  if (draw) {
    winningMessageTextElement.textContent = "Draw!";
  } else {
    winningMessageTextElement.textContent = `${
      heartTurn ? "❤'s" : "X's"
    } Wins!`;
  }
  winningMessageElement.classList.add("show");
}

function isDraw() {
  return [...cellElements].every((cell) => {
    return (
      cell.classList.contains(X_CLASS) || cell.classList.contains(HEART_CLASS)
    );
  });
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function swapTurns() {
  heartTurn = !heartTurn;
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(HEART_CLASS);

  if (heartTurn) {
    board.classList.add(HEART_CLASS);
  } else {
    board.classList.add(X_CLASS);
  }
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}
