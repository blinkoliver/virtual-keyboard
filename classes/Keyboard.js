import * as storage from "../utils/storage.js";
import create from "../utils/create.js";
import language from "../assets/index.js";
import Key from "./Key.js";

const main = create("main", "", [
  create("h1", "title", "RSS Virtual Keyboard"),
  create("h3", "subtitle", "Windows keyboard that has been made under MacOS"),
  create(
    "p",
    "hint",
    "Use left <kbd>Ctrl</kbd> + <kbd>Alt</kbd> or Lang button to switch language. Last language saves in localStorage <br/> click to body if you want hide keyboard"
  ),
]);

export default class Keyboard {
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
      ["placeholder", "Start type something..."],
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
      const rowElement = create("div", "keyboard__row", null, this.container, [
        "row",
        i + 1,
      ]);
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

    let textLang = document.createTextNode(`${storage.get("kbLang")}`);
    document.querySelector("[data-code='Lang'] .letter").appendChild(textLang);

    document.addEventListener("keydown", this.handleEvent);
    document.addEventListener("keyup", this.handleEvent);
    this.container.onmousedown = this.preHandleEvent;
    this.container.onmouseup = this.preHandleEvent;
  }
  hideLayout() {
    document.querySelector(".keyboard").style.visibility = "hidden";
  }
  showLayout() {
    document.querySelector(".keyboard").style.visibility = "visible";
  }

  preHandleEvent = (e) => {
    e.stopPropagation();
    const keyDiv = e.target.closest(".keyboard__key");
    if (!keyDiv) return;
    const {
      dataset: { code },
    } = keyDiv;
    keyDiv.addEventListener("mouseleave", this.resetButtonState);
    this.handleEvent({ code, type: e.type });
  };

  handleEvent = (e) => {
    if (e.stopPropagation) e.stopPropagation();

    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) return;
    this.output.focus();

    // НАЖАТИЕ КНОПКИ
    if (type.match(/keydown|mousedown/)) {
      if (!type.match(/mouse/)) e.preventDefault();

      if (code.match(/Voice/)) this.voiceRecorder();

      if (code.match(/Shift/)) this.shiftKey = true;
      if (this.shiftKey) this.switchUpperCase(true);

      if (code.match(/Control|Alt|Caps/) && e.repeat) return;

      if (code.match(/Control/)) this.ctrKey = true;
      if (code.match(/Alt/)) this.altKey = true;
      if (code.match(/Control/) && this.altKey) this.switchLanguage();
      if (code.match(/Alt/) && this.ctrKey) this.switchLanguage();
      if (code.match(/Lang/)) this.switchLanguage();
      keyObj.keyContainer.classList.add("active");

      if (code.match(/Caps/) && !this.isCaps) {
        this.isCaps = true;
        this.switchUpperCase(true);
      } else if (code.match(/Caps/) && this.isCaps) {
        this.isCaps = false;
        this.switchUpperCase(false);
        keyObj.keyContainer.classList.remove("active");
      }

      // Определяем, какой символ мы пишем в консоль (спец или основной)
      if (!this.isCaps) {
        // если не зажат капс, смотрим не зажат ли шифт
        this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
      } else if (this.isCaps) {
        // если зажат капс
        if (this.shiftKey) {
          // и при этом зажат шифт - то для кнопки со спецсимволом даем верхний регистр
          this.printToOutput(
            keyObj,
            keyObj.sub.innerHTML ? keyObj.shift : keyObj.small
          );
        } else {
          // и при этом НЕ зажат шифт - то для кнопки без спецсивмола даем верхний регистр
          this.printToOutput(
            keyObj,
            !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small
          );
        }
      }
      this.keysPressed[keyObj.code] = keyObj;
      // ОТЖАТИЕ КНОПКИ
    } else if (e.type.match(/keyup|mouseup/)) {
      this.resetPressedButtons(code);
      // if (code.match(/Shift/) && !this.keysPressed[code])
      if (code.match(/Shift/)) {
        this.shiftKey = false;
        this.switchUpperCase(false);
      }
      if (code.match(/Control/)) this.ctrKey = false;
      if (code.match(/Alt/)) this.altKey = false;

      if (!code.match(/Caps/)) keyObj.keyContainer.classList.remove("active");
    }
  };

  resetButtonState = ({
    target: {
      dataset: { code },
    },
  }) => {
    if (code.match("Shift")) {
      this.shiftKey = false;
      this.switchUpperCase(false);
      this.keysPressed[code].keyContainer.classList.remove("active");
    }
    if (code.match(/Control/)) this.ctrKey = false;
    if (code.match(/Alt/)) this.altKey = false;
    this.resetPressedButtons(code);
    this.output.focus();
  };

  resetPressedButtons = (targetCode) => {
    if (!this.keysPressed[targetCode]) return;
    if (!this.isCaps)
      this.keysPressed[targetCode].keyContainer.classList.remove("active");
    this.keysPressed[targetCode].keyContainer.removeEventListener(
      "mouseleave",
      this.resetButtonState
    );
    delete this.keysPressed[targetCode];
  };

  switchUpperCase(isTrue) {
    // Флаг - чтобы понимать, мы поднимаем регистр или опускаем
    if (isTrue) {
      // Мы записывали наши кнопки в keyButtons, теперь можем легко итерироваться по ним
      this.keyButtons.forEach((button) => {
        // Если у кнопки есть спецсивол - мы должны переопределить стили
        if (button.sub) {
          // Если только это не капс, тогда поднимаем у спецсимволов
          if (this.shiftKey) {
            button.sub.classList.add("sub-active");
            button.letter.classList.add("sub-inactive");
          }
        }
        // Не трогаем функциональные кнопки
        // И если капс, и не шифт, и именно наша кнопка без спецсимвола
        if (
          !button.isFnKey &&
          this.isCaps &&
          !this.shiftKey &&
          !button.sub.innerHTML
        ) {
          // тогда поднимаем регистр основного символа letter
          button.letter.innerHTML = button.shift;
          // Если капс и зажат шифт
        } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
          // тогда опускаем регистр для основного симовла letter
          button.letter.innerHTML = button.small;
          // а если это просто шифт - тогда поднимаем регистр у основного символа
          // только у кнопок, без спецсимвола --- там уже выше отработал код для них
        } else if (!button.isFnKey && !button.sub.innerHTML) {
          button.letter.innerHTML = button.shift;
        }
      });
    } else {
      // опускаем регистр в обратном порядке
      this.keyButtons.forEach((button) => {
        // Не трогаем функциональные кнопки
        // Если есть спецсимвол
        if (button.sub.innerHTML && !button.isFnKey) {
          // то возвращаем в исходное
          button.sub.classList.remove("sub-active");
          button.letter.classList.remove("sub-inactive");
          // если не зажат капс
          if (!this.isCaps) {
            // то просто возвращаем основным символам нижний регистр
            button.letter.innerHTML = button.small;
          } else if (!this.isCaps) {
            // если капс зажат - то возвращаем верхний регистр
            button.letter.innerHTML = button.shift;
          }
          // если это кнопка без спецсимвола (снова не трогаем функциональные)
        } else if (!button.isFnKey) {
          // то если зажат капс
          if (this.isCaps) {
            // возвращаем верхний регистр
            button.letter.innerHTML = button.shift;
          } else {
            // если отжат капс - возвращаем нижний регистр
            button.letter.innerHTML = button.small;
          }
        }
      });
    }
  }

  switchLanguage = () => {
    const langAbbr = Object.keys(language);
    let langIdx = langAbbr.indexOf(this.container.dataset.language);
    this.keyBase =
      langIdx + 1 < langAbbr.length
        ? language[langAbbr[(langIdx += 1)]]
        : language[langAbbr[(langIdx -= langIdx)]];

    this.container.dataset.language = langAbbr[langIdx];
    storage.set("kbLang", langAbbr[langIdx]);

    this.keyButtons.forEach((button) => {
      const keyObj = this.keyBase.find((key) => key.code === button.code);
      if (!keyObj) return;
      button.shift = keyObj.shift;
      button.small = keyObj.small;
      if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
        button.sub.innerHTML = keyObj.shift;
      } else {
        button.sub.innerHTML = "";
      }
      button.letter.innerHTML = keyObj.small;
    });
    if (this.isCaps) this.switchUpperCase(true);
    let textLang = document.createTextNode(`${langAbbr[langIdx]}`);
    document.querySelector("[data-code='Lang'] .letter").appendChild(textLang);
  };

  voiceRecorder = () => {
    const voiceButton = document.querySelector("[data-code = 'Voice']");
    voiceButton.classList.toggle("silent");

    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = `${storage.get("kbLang")}`;

    let text = document.createTextNode("");
    const output = document.querySelector(".output");
    output.appendChild(text);

    if (voiceButton.className === "keyboard__key silent") {
      recognition.addEventListener("result", (e) => {
        const transcript = Array.from(e.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        if (e.results[0].isFinal) {
          text = document.createTextNode(`${transcript}`);
          output.appendChild(text);
        }
      });
      recognition.addEventListener("end", recognition.start);
      recognition.start();
    } else {
      recognition.removeEventListener("result", (e) => {
        const transcript = Array.from(e.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        if (e.results[0].isFinal) {
          text = document.createTextNode(`${transcript}`);
          output.appendChild(text);
        }
      });
      recognition.removeEventListener("end", recognition.start);
      recognition.stop();
      recognition = null;
    }
  };

  printToOutput(keyObj, symbol) {
    let cursorPos = this.output.selectionStart;
    const left = this.output.value.slice(0, cursorPos);
    const right = this.output.value.slice(cursorPos);
    const textHandlers = {
      Tab: () => {
        this.output.value = `${left}\t${right}`;
        cursorPos += 1;
      },
      ArrowLeft: () => {
        cursorPos = cursorPos - 1 >= 0 ? cursorPos - 1 : 0;
      },
      ArrowRight: () => {
        cursorPos += 1;
      },
      ArrowUp: () => {
        const positionFromLeft = this.output.value
          .slice(0, cursorPos)
          .match(/(\n).*$(?!\1)/g) || [[1]];
        cursorPos -= positionFromLeft[0].length;
      },
      ArrowDown: () => {
        const positionFromLeft = this.output.value
          .slice(cursorPos)
          .match(/^.*(\n).*(?!\1)/) || [[1]];
        cursorPos += positionFromLeft[0].length;
      },
      Enter: () => {
        this.output.value = `${left}\n${right}`;
        cursorPos += 1;
      },
      Delete: () => {
        this.output.value = `${left}${right.slice(1)}`;
      },
      Backspace: () => {
        this.output.value = `${left.slice(0, -1)}${right}`;
        cursorPos -= 1;
      },
      Space: () => {
        this.output.value = `${left} ${right}`;
        cursorPos += 1;
      },
    };
    if (textHandlers[keyObj.code]) textHandlers[keyObj.code]();
    else if (!keyObj.isFnKey) {
      cursorPos += 1;
      this.output.value = `${left}${symbol || ""}${right}`;
    }
    this.output.setSelectionRange(cursorPos, cursorPos);
  }
}
