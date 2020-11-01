export let set = (name, value) => {
  window.localStorage.setItem(name, JSON.stringify(value));
};
export let get = (name, substr = null) =>
  JSON.parse(window.localStorage.getItem(name) || substr);
