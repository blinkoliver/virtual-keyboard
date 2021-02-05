let create = (el, classNames, childs, parent, ...dataAttr) => {
  //Create element
  let element = null;
  try {
    element = document.createElement(el);
  } catch (error) {
    throw new Error("bad tag element");
  }
  //Add ClassName
  if (classNames) {
    element.classList.add(...classNames.split(" "));
  }
  //Add Child
  if (childs && Array.isArray(childs)) {
    childs.forEach((childElement) => {
      childElement && element.appendChild(childElement);
    });
  } else if (childs && typeof childs === "object") {
    element.appendChild(childs);
  } else if (childs && typeof childs === "string") {
    element.innerHTML = childs;
  }
  //Add Parent
  if (parent) {
    parent.appendChild(element);
  }
  //Add DatAttr
  if (dataAttr.length > 0) {
    dataAttr.forEach(([attrName, attrValue]) => {
      if (attrValue === "") {
        element.setAttribute(attrName, "");
      } else {
        if (
          attrName.match(
            /value|id|placeholder|cols|rows|autocorrect|spellcheck/
          )
        ) {
          element.setAttribute(attrName, attrValue);
        } else {
          element.dataset[attrName] = attrValue;
        }
      }
    });
  }

  return element;
};

export default create;
