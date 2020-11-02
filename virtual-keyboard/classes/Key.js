import create from "../utils/create.js";
class Key {
  constructor({ small, shift, code }) {
    this.small = small;
    this.shift = shift;
    this.code = code;
    this.isFnKey = Boolean(
      small.match(/Ctrl|Shift|Alt|arr|Tab|Back|Enter|Caps|Del|Command|Lang|Mute|Voice/)
    );
    if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
      this.sub = create("div", "sub", this.shift);
    } else {
      this.sub = create("div", "sub", " ");
    }
    this.letter = create("div", "letter", small);
    this.keyContainer = create(
      "div",
      "keyboard__key",
      [this.sub, this.letter],
      null,
      ["code", this.code],
      this.isFnKey ? ["fn", "true"] : ["fn", "false"]
    );
  }
}

export default Key;
