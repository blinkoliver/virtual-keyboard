import { get } from "./utils/storage.js";
import Keyboard from "./classes/Keyboard.js";

const rowsOrder = [
  [
    "Backquote",
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9",
    "Digit0",
    "Minus",
    "Equal",
    "Voice",
    "Delete",
  ],
  [
    "Tab",
    "KeyQ",
    "KeyW",
    "KeyE",
    "KeyR",
    "KeyT",
    "KeyY",
    "KeyU",
    "KeyI",
    "KeyO",
    "KeyP",
    "BracketLeft",
    "BracketRight",
    "Backspace",
  ],
  [
    "CapsLock",
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyF",
    "KeyG",
    "KeyH",
    "KeyJ",
    "KeyK",
    "KeyL",
    "Semicolon",
    "Quote",
    "Backslash",
    "Enter",
  ],
  [
    "ShiftLeft",
    "IntlBackslash",
    "KeyZ",
    "KeyX",
    "KeyC",
    "KeyV",
    "KeyB",
    "KeyN",
    "KeyM",
    "Comma",
    "Period",
    "Slash",
    "ArrowUp",
    "ShiftRight",
  ],
  [
    "Lang",
    "ControlLeft",
    "AltLeft",
    "MetaLeft",
    "Space",
    "MetaRight",
    "AltRight",
    "ArrowLeft",
    "ArrowDown",
    "ArrowRight",
    "Mute",
  ],
];
const lang = get("kbLang", '"ru"');
new Keyboard(rowsOrder).init(lang).generateLayout(false);

//hide & show keyboard
let showKeyboard = () => {
  new Keyboard().showLayout();
};
let hideKeyboard = (event) => {
  if (
    event.target !== document.querySelector(".output") &&
    event.target === document.querySelector("body")
  )
    new Keyboard().hideLayout();
};

document.querySelector(".output").addEventListener("click", showKeyboard);
document.querySelector("body").addEventListener("click", hideKeyboard);

//mute & unmute
const audioFn = document.querySelector(".click-fn");
const audioRu = document.querySelector(".click-ru");
const audioEn = document.querySelector(".click-en");
const muteButton = document.querySelector("[data-code = 'Mute']");

let changeMute = (e) => {
  muteButton.classList.toggle("silent");
};
muteButton.addEventListener("click", changeMute);

let playMute = (e) => {
  if (
    e.target.closest(".keyboard__key").attributes["data-fn"].value === "true" &&
    document.querySelector("[data-code = 'Mute']").className === "keyboard__key"
  )
    audioFn.play();
  if (
    `${get("kbLang")}` === "ru" &&
    e.target.closest(".keyboard__key").attributes["data-fn"].value ===
      "false" &&
    document.querySelector("[data-code = 'Mute']").className === "keyboard__key"
  )
    audioRu.play();
  if (
    `${get("kbLang")}` === "en" &&
    e.target.closest(".keyboard__key").attributes["data-fn"].value ===
      "false" &&
    document.querySelector("[data-code = 'Mute']").className === "keyboard__key"
  )
    audioEn.play();
};

let fnButtons = document.querySelectorAll("[data-fn = 'true']");
let letterButtons = document.querySelectorAll("[data-fn = 'false']");

letterButtons.forEach((element) => {
  element.addEventListener("click", playMute);
});
fnButtons.forEach((element) => {
  element.addEventListener("click", playMute);
});
