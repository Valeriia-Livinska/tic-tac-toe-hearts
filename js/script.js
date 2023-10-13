import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const X_CLASS = "x";
const HEART_CLASS = "heart";
const STORAGE_KEY = "saved-sets";
const THEME_KEY = "theme-settings";

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
const selectTextContent = document.querySelector(".select-text");
const selectList = document.querySelector(".select-list");
const confirmation = document.querySelector(".confirmation-wrapper");
const confirmDel = document.getElementById("confirmDel");
const confirmCancel = document.getElementById("confirmCancel");
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
let currentDelBtn;

let xIcon = convertValueToUnicode("58");
let heartIcon = convertValueToUnicode("f004");

// to disable player icon selection after the game started (first mark placing)
let executedOnce;

startGame();
initThemeSelector();

// event listeners
selectBtn.addEventListener("click", onSelectBtnClick);
confirmDel.addEventListener("click", handleConfirmDel);
confirmCancel.addEventListener("click", handleConfirmCancel);
form.addEventListener("submit", setCreate);
clearBtn.addEventListener("click", handleFormClear);
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

  // download from localStorage
  savedSets = loadFromLocalStorage(STORAGE_KEY);
  if (savedSets && savedSets.length !== 0) {
    fillInSelectOptions();
  } else {
    savedSets = [];
  }

  // check if was previous theme settings and implement
  loadThemeSettings();
}

function initThemeSelector() {
  themeRadioBtns.forEach((themeBtn) => {
    themeBtn.addEventListener("click", onThemeClick);
  });

  function onThemeClick(event) {
    body.setAttribute("data-theme", event.target.value);
    themeSettings.theme = event.target.value;
    saveToLocalStorage(themeSettings, THEME_KEY);
  }
}

function loadThemeSettings() {
  themeSettings = loadFromLocalStorage(THEME_KEY);
  if (themeSettings) {
    if (themeSettings.fontSize) {
      sliderEl.value = themeSettings.fontSize;
    }
    if (themeSettings.theme) {
      body.setAttribute("data-theme", themeSettings.theme);
      // mark theme icon as checked
      const choosenThemeEl = document.querySelector(
        `input[value="${themeSettings.theme}"]`
      );
      choosenThemeEl.checked = true;
    }
  } else {
    themeSettings = {
      fontSize: "",
      theme: "",
    };
  }
}

// changing icons in settings
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

function loadFromLocalStorage(key) {
  try {
    const serializedState = localStorage.getItem(key);
    return serializedState === null ? undefined : JSON.parse(serializedState);
  } catch (error) {
    console.error("Get state error: ", error.message);
  }
}

function saveToLocalStorage(value, key) {
  try {
    const serializedState = JSON.stringify(value);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.error("Set state error: ", error.message);
  }
}

function setCreate(event) {
  event.preventDefault();
  if (savedSets.length === 15) {
    Toastify({
      text: "Sorry, but you are not allowed to create more than 15 sets",
      duration: 2500,
      gravity: "top",
      position: "left",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #EE0022, #e74c3c)",
      },
    }).showToast();
    handleFormClear();
    return;
  }

  const newSetName = setsName.value.toLowerCase().trim();

  // checking is name aleready in the saved list
  const setNameNotAvailable = savedSets.some((set) => {
    return set.setName === newSetName;
  });

  if (setNameNotAvailable) {
    Toastify({
      text: "This Set name is already in use",
      duration: 2500,
      gravity: "top",
      position: "left",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #EE0022, #e74c3c)",
      },
    }).showToast();
    return;
  } else {
    wordsArr = [];

    inputElements.forEach((input) => {
      wordsArr.push(input.value.toLowerCase().trim());
    });

    newSet = {
      setName: newSetName,
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

    saveToLocalStorage(savedSets, STORAGE_KEY);
    fillInSelectOptions();
  }
}

function onSelectBtnClick() {
  selectBtn.classList.toggle("open");
}

function fillInSelectOptions() {
  const optionsArr = savedSets.map(
    (set) => `<li class="select-item" value=${set.setName}>
                <span class="select-item-text">${set.setName}</span>
                <button class="delete-btn" data-delbtn = ${set.setName}>
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </li>`
  );

  const options = optionsArr.join("\n");
  selectList.innerHTML = options;

  const selectItemsText = document.querySelectorAll(".select-item-text");
  const deleteSetBtns = document.querySelectorAll(".delete-btn");

  selectItemsText.forEach((item) => {
    item.addEventListener("click", onChooseSetCLick);
  });

  deleteSetBtns.forEach((delBtn) => {
    delBtn.addEventListener("click", onDeleteBtnClick);
  });
}

function onChooseSetCLick(event) {
  const choosenSet = savedSets.find((set) => {
    return set.setName === event.target.textContent;
  });
  fillCells(choosenSet.setWords);
  // set select value as choosen
  selectTextContent.textContent = choosenSet.setName;
  // close select list
  selectBtn.classList.remove("open");
}

function onDeleteBtnClick(event) {
  // show confirmation
  body.classList.add("blocked");
  const x = event.clientX * 1.05;
  const y = event.clientY * 0.55;

  confirmation.style.left = x + "px";
  confirmation.style.top = y + "px";
  confirmation.classList.add("show");
  //

  currentDelBtn = event.currentTarget;
}

function handleConfirmDel() {
  const setToRemove = currentDelBtn.getAttribute("data-delbtn");
  const savedSetsWithoutDel = savedSets.filter((set) => {
    return set.setName !== setToRemove;
  });
  savedSets = [...savedSetsWithoutDel];
  saveToLocalStorage(savedSets, STORAGE_KEY);
  fillInSelectOptions();
  handleCellsClear();
  selectTextContent.textContent = "Select a set";
  body.classList.remove("blocked");
  confirmation.classList.remove("show");
}

function handleConfirmCancel() {
  body.classList.remove("blocked");
  confirmation.classList.remove("show");
}

function fillCells(arr) {
  cellElements.forEach((cell, index) => {
    cell.textContent = "";
    cell.textContent = arr[index];
    cell.style.fontSize = `${sliderEl.value}px`;
  });
}

function handleFormClear() {
  form.reset();
}

function handleCellsClear() {
  cellElements.forEach((cell) => {
    cell.textContent = "";
  });
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

function handleFontSizeControl() {
  cellElements.forEach((cell) => {
    cell.style.fontSize = `${sliderEl.value}px`;
  });
  themeSettings.fontSize = sliderEl.value;
  saveToLocalStorage(themeSettings, THEME_KEY);
}
