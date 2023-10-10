import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const X_CLASS = "x";
const HEART_CLASS = "heart";
const STORAGE_KEY = "saved-sets";
const THEME_KEY = "theme-settings";
axios.defaults.baseURL = "https://63ab93b5fdc006ba6060fe38.mockapi.io";

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

// DOM elements
const body = document.querySelector("body");

// for list of sets
const selectBtn = document.getElementById("selectBtn");
const selectItems = document.querySelectorAll(".select-item-text");
const deleteSetBtn = document.querySelectorAll(".delete-btn");
//

const form = document.getElementById("inputForm");
const setsName = document.getElementById("setsName");
const inputElements = document.querySelectorAll("[data-cell-value]");
const clearBtn = document.getElementById("clearButton");

const sliderEl = document.getElementById("fontSizeControl");

const firstPlayerIcons = document.getElementsByName("first-player-icon");
const secondPlayerIcons = document.getElementsByName("second-player-icon");

const themeRadioBtns = document.getElementsByName("theme-color");

const cellElements = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");
const undoBtn = document.getElementById("undoBtn");
const setSelect = document.getElementById("setSelect");

const winningMessageElement = document.getElementById("winningMessage");
const winningMessageTextElement = document.querySelector(
  "[data-winning-message-text]"
);
const restartBtn = document.getElementById("restartButton");

let savedSets;
let newSet = {};
let themeSettings;
let heartTurn;
let wordsArr;
let currentCell;

let xIcon = convertValueToUnicode("58");
let heartIcon = convertValueToUnicode("f004");

// to disable player icon selection after the game started (first mark placing)
let executedOnce;

startGame();
initThemeSelector();
// fillInSelectOptions();

// event listeners
form.addEventListener("submit", setCreate);
clearBtn.addEventListener("click", handleClear);
sliderEl.addEventListener("input", handleFontSizeControl);
firstPlayerIcons.forEach((firstIconBtn) => {
  firstIconBtn.addEventListener("click", onXIconChangeClick);
});
secondPlayerIcons.forEach((secondIconBtn) => {
  secondIconBtn.addEventListener("click", onHeartIconChangeClick);
});
undoBtn.addEventListener("click", handleUndo);
restartBtn.addEventListener("click", startGame);

function startGame() {
  heartTurn = false;
  undoBtn.disabled = true;
  executedOnce = false;
  allowPlayerIconChange();
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(HEART_CLASS);
    cell.setAttribute("data-content", "");
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });
  setBoardHoverClass();
  winningMessageElement.classList.remove("show");

  savedSets = loadSetsFromLocalStorage();

  if (savedSets && savedSets.length !== 0) {
    // savedSets = loadStorage();
    // fillInputs(wordsArr);
    // fillCells(wordsArr);
    // fillInSelectOptions();
  } else {
    savedSets = [];
  }
}

// for list of sets
selectBtn.addEventListener("click", () => {
  selectBtn.classList.toggle("open");
});

selectItems.forEach((item) => {
  item.addEventListener("click", () => {
    console.log("choosen");
  });
});

deleteSetBtn.forEach((delBtn) => {
  delBtn.addEventListener("click", () => {
    console.log("delete");
  });
});

function initThemeSelector() {
  themeRadioBtns.forEach((themeBtn) => {
    // themeBtn.removeEventListener("click", onThemeClick);
    themeBtn.addEventListener("click", onThemeClick);
  });

  function onThemeClick(event) {
    body.setAttribute("data-theme", event.target.value);
  }
}

function onXIconChangeClick(event) {
  xIcon = convertValueToUnicode(event.target.value);
}

function onHeartIconChangeClick(event) {
  heartIcon = convertValueToUnicode(event.target.value);
}

function convertValueToUnicode(value) {
  return String.fromCodePoint(parseInt(value, 16));
}

function cellsHover() {
  cellElements.forEach((cell) => {
    if (
      board.classList.contains("x") &&
      !cell.classList.contains("x") &&
      !cell.classList.contains("heart")
    ) {
      cell.onmouseover = () => {
        cell.setAttribute("data-content", xIcon);
      };
    }

    if (
      board.classList.contains("heart") &&
      !cell.classList.contains("x") &&
      !cell.classList.contains("heart")
    ) {
      cell.onmouseover = () => {
        cell.setAttribute("data-content", heartIcon);
      };
    }
  });
}

function loadSetsFromLocalStorage() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    return serializedState === null ? undefined : JSON.parse(serializedState);
  } catch (error) {
    console.error("Get state error: ", error.message);
  }
}

function saveSetToLocalStorage(value) {
  try {
    const serializedState = JSON.stringify(value);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Set state error: ", error.message);
  }
}

// function fillInputs(arr) {
//   inputElements.forEach((input, index) => {
//     input.value = arr[index];
//   });
// }

function setCreate(event) {
  event.preventDefault();
  wordsArr = [];

  inputElements.forEach((input) => {
    wordsArr.push(input.value.toLowerCase().trim());
  });

  newSet = {
    setName: setsName.value.toLowerCase().trim(),
    setWords: wordsArr,
  };
  savedSets.push(newSet);

  form.reset();
  Toastify({
    text: "New set was created",
    duration: 1300,
    gravity: "top",
    position: "left",
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();

  saveSetToLocalStorage(savedSets);
  // await addSet(newSet);
  // fillInSelectOptions();
}

// async function addSet(newSet) {
//   try {
//     await axios.post("/sets", newSet);
//   } catch (error) {
//     console.log(error);
//   }
// }

// async function getAllSets() {
//   try {
//     const response = await axios.get("/sets");
//     const { data } = response;
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// }

// function fillInSelectOptions() {
//   const optionsArr = savedSets.map(
//     (set) => `<option value=${set.setName}>${set.setName}</option>`
//   );

//   optionsArr.unshift(`<option selected disabled>Select a set</option>`);
//   const options = optionsArr.join("\n");
//   setSelect.innerHTML = options;

//   setSelect.onchange = function (event) {
//     const choosenSet = savedSets.find((set) => {
//       return set.setName === event.target.value;
//     });
//     fillCells(choosenSet.setWords);
//   };
// }

function fillCells(arr) {
  cellElements.forEach((cell, index) => {
    cell.textContent = "";
    cell.textContent = arr[index];
  });
}

// function handleDoneBtnClick(event) {
//   event.preventDefault();
//   wordsArr = [];
//   inputElements.forEach((input) => {
//     wordsArr.push(input.value);
//   });
//   fillCells(wordsArr);
//   saveStorage(wordsArr);
// }

function handleClear() {
  form.reset();
  // cellElements.forEach((cell) => {
  //   cell.textContent = "";
  // });
  // wordsArr = [];
  // saveStorage(wordsArr);
}

function handleClick(event) {
  disablePlayerIconChange();
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
      heartTurn ? heartIcon : xIcon
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

  if (currentClass === X_CLASS) {
    cell.setAttribute("data-content", xIcon);
  }
  if (currentClass === HEART_CLASS) {
    cell.setAttribute("data-content", heartIcon);
  }

  undoBtn.disabled = false;
  currentCell = cell;
}

function disablePlayerIconChange() {
  // has to be done only once after first placing the icon
  if (!executedOnce) {
    executedOnce = true;
    firstPlayerIcons.forEach((firstIconBtn) => {
      firstIconBtn.disabled = true;
    });
    secondPlayerIcons.forEach((secondIconBtn) => {
      secondIconBtn.disabled = true;
    });
  }
}

function allowPlayerIconChange() {
  firstPlayerIcons.forEach((firstIconBtn) => {
    firstIconBtn.disabled = false;
  });
  secondPlayerIcons.forEach((secondIconBtn) => {
    secondIconBtn.disabled = false;
  });
}

function swapTurns() {
  heartTurn = !heartTurn;
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(HEART_CLASS);

  if (heartTurn) {
    board.classList.add(HEART_CLASS);
    cellsHover();
  } else {
    board.classList.add(X_CLASS);
    cellsHover();
  }
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}

function handleUndo() {
  if (heartTurn) {
    currentCell.classList.remove(X_CLASS);
  } else {
    currentCell.classList.remove(HEART_CLASS);
  }
  undoBtn.disabled = true;
  currentCell.removeEventListener("click", handleClick);
  currentCell.addEventListener("click", handleClick, { once: true });
  swapTurns();
  setBoardHoverClass();
}

function handleFontSizeControl(event) {
  cellElements.forEach((cell) => {
    cell.style.fontSize = `${sliderEl.value}px`;
  });
}
