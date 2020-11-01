import * as storage from "../utils/storage.js";
import create from "../utils/create.js";
import language from "../assets/index.js";
import Key from "./Key.js";

const main = create("main", "", [
  create("h1", "title", "RSS Virtual Keyboard"),
  create("h3", "subtitle", "This keyboard that has been made under macos"),
  create(
    "p",
    "hint",
    "Use left <kbd>Ctrl</kbd> + <kbd>Alt</kbd> to switch language."
  ),
]);

class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {};
    this.isCaps = false;
  }
  init(langCode) {
    this.keyBase = language[langCode];
    this.output = create(
      "textarea",
      "output",
      null,
      main,
      ["placeholder", "Start typesomething..."],
      ["rows", 5],
      ["cols", 50],
      ["spellcheck", false],
      ["autocorrect", "off"]
    );
    this.container = create("div", "keyboard", null, main, [
      "language",
      langCode,
    ]);
    document.body.prepend(main);
    return this;
  }
  generateLayout() {
    this.keyButtons = [];
    this.rowsOrder.forEach((row, i) => {
      const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.appendChild(keyButton.keyContainer);
        }
      });
    });
  }
}

export default Keyboard;
