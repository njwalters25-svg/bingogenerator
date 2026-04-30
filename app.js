const form = document.querySelector("#bingoForm");
const cardsContainer = document.querySelector("#cards");
const extrasContainer = document.querySelector("#extras");
const cardTemplate = document.querySelector("#cardTemplate");
const instructionsTemplate = document.querySelector("#instructionsTemplate");
const masterListTemplate = document.querySelector("#masterListTemplate");
const markersTemplate = document.querySelector("#markersTemplate");
const statusMessage = document.querySelector("#statusMessage");
const cardTotal = document.querySelector("#cardTotal");
const listHelp = document.querySelector("#listHelp");
const qualityWarnings = document.querySelector("#qualityWarnings");
const freeImageInput = document.querySelector("#freeImage");
const printButton = document.querySelector("#printButton");
const schemeGrid = document.querySelector("#schemeGrid");
const fontStyle = document.querySelector("#fontStyle");
const occasionFont = document.querySelector("#occasionFont");
const occasionSize = document.querySelector("#occasionSize");
const occasionSizeValue = document.querySelector("#occasionSizeValue");
const titleSize = document.querySelector("#titleSize");
const titleSizeValue = document.querySelector("#titleSizeValue");
const gridStyle = document.querySelector("#gridStyle");
const pageSize = document.querySelector("#pageSize");
const cardsPerPage = document.querySelector("#cardsPerPage");
const printPageStyle = document.querySelector("#printPageStyle");
const primaryColor = document.querySelector("#primaryColor");
const highlightColor = document.querySelector("#highlightColor");
const titleColor = document.querySelector("#titleColor");
const occasionColor = document.querySelector("#occasionColor");

let freeImageData = "";
let isRestoringSettings = false;

const storageKey = "allOccasionsBingoSettings";

const inputs = {
  occasion: document.querySelector("#occasionInput"),
  title: document.querySelector("#titleInput"),
  count: document.querySelector("#cardCount"),
  items: document.querySelector("#itemList"),
  freeText: document.querySelector("#freeText"),
  includeInstructions: document.querySelector("#includeInstructions"),
  includeMasterList: document.querySelector("#includeMasterList"),
  includeMarkers: document.querySelector("#includeMarkers"),
};

const centerIndex = 12;
const storeFooter = "alloccasionprints.etsy.com";
const pageDimensions = {
  letter: [816, 1056],
  a4: [794, 1123],
};
const schemeColors = {
  party: ["#d94841", "#178f88", "#7a2f82", "#d94841"],
  primary: ["#d62828", "#1d4ed8", "#111827", "#d62828"],
  pastel: ["#f4a6c1", "#8ddad5", "#8e6cc8", "#d7833f"],
  kids: ["#ff6b35", "#00b4d8", "#53389e", "#0f8a5f"],
  teen: ["#ff2aa1", "#00b4ff", "#7c3aed", "#111827"],
  masculine: ["#243447", "#2f6f73", "#8c3f2b", "#c9932b"],
  feminine: ["#d65a87", "#8e5aa8", "#9b2f67", "#c06c84"],
  earth: ["#6f4e37", "#6c8f4e", "#2f5d50", "#b85c38"],
  coastal: ["#0e7490", "#f4a261", "#275f75", "#2a9d8f"],
  luxury: ["#111827", "#b08d57", "#7f1d1d", "#111827"],
  christmas: ["#b91c1c", "#166534", "#7f1212", "#d4af37"],
  halloween: ["#111111", "#f97316", "#7e22ce", "#111111"],
};
const occasionFontMaxSizes = {
  1: {
    bold: 48,
    script: 65,
    serif: 62,
    modern: 54,
    playful: 58,
    groovy: 64,
    handwritten: 58,
  },
  2: {
    bold: 36,
    script: 46,
    serif: 44,
    modern: 40,
    playful: 42,
    groovy: 46,
    handwritten: 42,
  },
};

function parseItems(value) {
  return [...new Set(
    value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function makeCardItems(items) {
  const chosenItems = shuffle(items).slice(0, 24);
  chosenItems.splice(centerIndex, 0, "__FREE__");
  return chosenItems;
}

function getCardSignature(cardItems) {
  return cardItems.join("|");
}

function makeUniqueCards(items, count) {
  const cards = [];
  const signatures = new Set();
  let attempts = 0;

  while (cards.length < count && attempts < count * 80) {
    const cardItems = makeCardItems(items);
    const signature = getCardSignature(cardItems);
    if (!signatures.has(signature)) {
      signatures.add(signature);
      cards.push(cardItems);
    }
    attempts += 1;
  }

  return cards;
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function getSettingsSnapshot() {
  return {
    occasion: inputs.occasion.value,
    title: inputs.title.value,
    count: inputs.count.value,
    items: inputs.items.value,
    freeText: inputs.freeText.value,
    includeInstructions: inputs.includeInstructions.checked,
    includeMasterList: inputs.includeMasterList.checked,
    includeMarkers: inputs.includeMarkers.checked,
    fontStyle: fontStyle.value,
    occasionFont: occasionFont.value,
    occasionSize: occasionSize.value,
    titleSize: titleSize.value,
    gridStyle: gridStyle.value,
    pageSize: pageSize.value,
    cardsPerPage: cardsPerPage.value,
    primaryColor: primaryColor.value,
    highlightColor: highlightColor.value,
    titleColor: titleColor.value,
    occasionColor: occasionColor.value,
  };
}

function saveSettings() {
  if (isRestoringSettings) {
    return;
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(getSettingsSnapshot()));
  } catch {
    // If browser storage is unavailable, the generator should still work normally.
  }
}

function restoreSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(storageKey));
    if (!savedSettings) {
      return;
    }

    isRestoringSettings = true;
    inputs.occasion.value = savedSettings.occasion ?? inputs.occasion.value;
    inputs.title.value = savedSettings.title || inputs.title.value;
    inputs.count.value = savedSettings.count || inputs.count.value;
    inputs.items.value = savedSettings.items ?? inputs.items.value;
    inputs.freeText.value = savedSettings.freeText || inputs.freeText.value;
    inputs.includeInstructions.checked = savedSettings.includeInstructions ?? inputs.includeInstructions.checked;
    inputs.includeMasterList.checked = savedSettings.includeMasterList ?? inputs.includeMasterList.checked;
    inputs.includeMarkers.checked = savedSettings.includeMarkers ?? inputs.includeMarkers.checked;
    fontStyle.value = savedSettings.fontStyle || fontStyle.value;
    occasionFont.value = savedSettings.occasionFont || occasionFont.value;
    occasionSize.value = savedSettings.occasionSize || occasionSize.value;
    titleSize.value = savedSettings.titleSize || titleSize.value;
    gridStyle.value = savedSettings.gridStyle || gridStyle.value;
    pageSize.value = savedSettings.pageSize || pageSize.value;
    cardsPerPage.value = savedSettings.cardsPerPage || cardsPerPage.value;
    primaryColor.value = savedSettings.primaryColor || primaryColor.value;
    highlightColor.value = savedSettings.highlightColor || highlightColor.value;
    titleColor.value = savedSettings.titleColor || titleColor.value;
    occasionColor.value = savedSettings.occasionColor || occasionColor.value;
  } catch {
    localStorage.removeItem(storageKey);
  } finally {
    isRestoringSettings = false;
  }
}

function updateListHelp() {
  const itemCount = parseItems(inputs.items.value).length;
  if (itemCount === 0) {
    listHelp.textContent = "Paste one item per line. Commas also work, but one per line is easiest to check.";
  } else if (itemCount < 24) {
    listHelp.textContent = `${itemCount} unique item${itemCount === 1 ? "" : "s"} added. Add at least 24 for a full card with one free square.`;
  } else if (itemCount < 50) {
    listHelp.textContent = `${itemCount} unique items added. This works, but 50-75 gives better variety across multiple cards.`;
  } else {
    listHelp.textContent = `${itemCount} unique items added. Great list size. Around 75 is ideal when generating lots of cards.`;
  }
}

function getHelpfulChecks(items, requestedCount) {
  if (items.length < 24) {
    return [];
  }

  const checks = [];
  const longestItem = items.reduce((longest, item) => item.length > longest.length ? item : longest, "");
  const hasVeryLongWord = items.some((item) => item.split(/\s+/).some((word) => word.length > 16));
  const freeLabel = inputs.freeText.value.trim();

  if (items.length < 50) {
    checks.push("For better variety across lots of cards, 50-75 items works better than a short list.");
  }

  if (requestedCount > 30 && items.length < 60) {
    checks.push("You are making quite a few cards from this list. Add more items if you want the cards to feel more different.");
  }

  if (longestItem.length > 52) {
    checks.push("Some items are very long and may print smaller. Shorten long titles or remove extra featuring details if needed.");
  } else if (hasVeryLongWord) {
    checks.push("Some long words or artist names may need extra space. Check the preview before printing.");
  }

  if (cardsPerPage.value === "2" && freeLabel.length > 16 && !freeImageData) {
    checks.push("The free square is much smaller in 2-per-page mode, so short free-square text will print best.");
  }

  return checks;
}

function renderHelpfulChecks(checks) {
  qualityWarnings.replaceChildren();
  checks.forEach((check) => {
    const item = document.createElement("li");
    item.textContent = check;
    qualityWarnings.append(item);
  });
}

function updateDesignSettings() {
  const occasionMaxSizes = occasionFontMaxSizes[cardsPerPage.value] || occasionFontMaxSizes[1];
  const occasionMaxSize = occasionMaxSizes[occasionFont.value] || 48;
  occasionSize.max = occasionMaxSize;
  if (Number(occasionSize.value) > occasionMaxSize) {
    occasionSize.value = occasionMaxSize;
  }

  document.body.dataset.font = fontStyle.value;
  document.body.dataset.occasionFont = occasionFont.value;
  document.body.dataset.grid = gridStyle.value;
  document.body.dataset.page = pageSize.value;
  document.body.dataset.cardsPerPage = cardsPerPage.value;
  occasionSizeValue.value = occasionSize.value;
  titleSizeValue.value = titleSize.value;
  document.documentElement.style.setProperty("--occasion-size", `${occasionSize.value}px`);
  document.documentElement.style.setProperty("--title-size", `${titleSize.value}px`);
  const printSizes = {
    letter: {
      1: "8.5in 11in",
      2: "11in 8.5in",
    },
    a4: {
      1: "210mm 297mm",
      2: "297mm 210mm",
    },
  };
  printPageStyle.textContent = `@page { size: ${printSizes[pageSize.value][cardsPerPage.value]}; margin: 0; }`;
  updatePreviewScale();
  fitAllSquareText();
}

function updateCustomColors() {
  document.body.dataset.customColors = "true";
  applyCurrentColors();
}

function applyCurrentColors() {
  const colorTargets = [document.documentElement, document.body];
  colorTargets.forEach((target) => {
    target.style.setProperty("--accent", primaryColor.value);
    target.style.setProperty("--accent-2", highlightColor.value);
    target.style.setProperty("--title-color", titleColor.value);
    target.style.setProperty("--occasion-color", occasionColor.value);
  });
}

function createSquare(value) {
  const square = document.createElement("div");
  square.className = "square";

  if (value === "__FREE__") {
    square.classList.add("free");
    if (freeImageData) {
      const image = document.createElement("img");
      image.src = freeImageData;
      image.alt = inputs.freeText.value.trim() || "Free square";
      square.append(image);
    } else {
      const freeLabel = inputs.freeText.value.trim() || "FREE";
      square.textContent = freeLabel;
      applyTextFitClasses(square, freeLabel);
    }
    return square;
  }

  square.textContent = value;
  applyTextFitClasses(square, value);
  return square;
}

function applyTextFitClasses(square, value) {
  if (value.split(/\s+/).some((word) => word.length > 12)) {
    square.classList.add("text-tight");
  }
  if (value.length > 42) {
    square.classList.add("text-xlong");
  } else if (value.length > 30) {
    square.classList.add("text-long");
  } else if (value.length > 18) {
    square.classList.add("text-medium");
  }
}

function fitSquareText(square) {
  if (square.querySelector("img")) {
    return;
  }

  square.style.fontSize = "";
  const baseSize = Number.parseFloat(getComputedStyle(square).fontSize);
  const minimumSize = cardsPerPage.value === "2" ? 5.8 : 8;
  let size = baseSize;

  while (size > minimumSize && (square.scrollHeight > square.clientHeight || square.scrollWidth > square.clientWidth)) {
    size -= 0.5;
    square.style.fontSize = `${size}px`;
  }
}

function fitAllSquareText() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".square").forEach(fitSquareText);
  });
}

function renderCards(cards) {
  cardsContainer.replaceChildren();

  cards.forEach((cardItems) => {
    const frame = document.createElement("div");
    frame.className = "card-frame";

    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector(".occasion").textContent = inputs.occasion.value.trim();
    card.querySelector("h3").textContent = inputs.title.value.trim() || "BINGO";
    card.querySelector("footer").textContent = storeFooter;

    const grid = card.querySelector(".bingo-grid");
    cardItems.forEach((value) => grid.append(createSquare(value)));
    frame.append(card);
    cardsContainer.append(frame);
  });

  cardTotal.textContent = `${cards.length} card${cards.length === 1 ? "" : "s"}`;
  fitAllSquareText();
  updatePreviewScale();
}

function createExtraFrame(page) {
  const frame = document.createElement("div");
  frame.className = "extra-frame";
  frame.append(page);
  return frame;
}

function renderInstructions() {
  return instructionsTemplate.content.firstElementChild.cloneNode(true);
}

function renderMasterList(items) {
  const page = masterListTemplate.content.firstElementChild.cloneNode(true);
  const list = page.querySelector(".master-list");
  const sortedItems = [...items].sort((first, second) => first.localeCompare(second, undefined, { sensitivity: "base" }));
  const columnCount = cardsPerPage.value === "2" ? 4 : 3;
  const rowCount = Math.ceil(sortedItems.length / columnCount);

  sortedItems.forEach((item, index) => {
    const column = Math.floor(index / rowCount);
    const rowPosition = index % rowCount;
    const row = document.createElement("div");
    row.className = "master-list-item";
    row.style.gridColumn = String(column + 1);
    row.style.gridRow = String(rowPosition + 1);

    const box = document.createElement("span");
    box.className = "check-box";
    box.setAttribute("aria-hidden", "true");

    const number = document.createElement("span");
    number.className = "master-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const text = document.createElement("span");
    text.className = "master-text";
    text.textContent = item;

    row.append(box, number, text);
    list.append(row);
  });
  return page;
}

function renderMarkers() {
  const page = markersTemplate.content.firstElementChild.cloneNode(true);
  const grid = page.querySelector(".markers-grid");
  const markerCount = cardsPerPage.value === "2" ? 99 : 42;
  const occasion = inputs.occasion.value.trim() || "Bingo";

  for (let marker = 0; marker < markerCount; marker += 1) {
    const token = document.createElement("span");
    token.className = "marker-token";

    const occasionText = document.createElement("span");
    occasionText.className = "marker-occasion";
    occasionText.textContent = occasion;

    const bingoText = document.createElement("span");
    bingoText.className = "marker-bingo";
    bingoText.textContent = inputs.title.value.trim() || "BINGO";

    token.append(occasionText, bingoText);
    grid.append(token);
  }
  return page;
}

function renderExtras(items) {
  extrasContainer.replaceChildren();
  document.body.dataset.hasExtras = "false";

  if (inputs.includeInstructions.checked) {
    extrasContainer.append(createExtraFrame(renderInstructions()));
  }

  if (inputs.includeMasterList.checked) {
    extrasContainer.append(createExtraFrame(renderMasterList(items)));
  }

  if (inputs.includeMarkers.checked) {
    extrasContainer.append(createExtraFrame(renderMarkers()));
  }

  if (extrasContainer.children.length > 0) {
    document.body.dataset.hasExtras = "true";
  }

  updatePreviewScale();
}

function updatePreviewScale() {
  const [pageWidth, pageHeight] = pageDimensions[pageSize.value];
  const isTwoUp = cardsPerPage.value === "2";
  const cardWidth = isTwoUp ? pageHeight / 2 : pageWidth;
  const cardHeight = isTwoUp ? pageWidth : pageHeight;
  const extraWidth = isTwoUp ? pageHeight : pageWidth;
  const extraHeight = isTwoUp ? pageWidth : pageHeight;
  [document.documentElement, document.body].forEach((target) => {
    target.style.setProperty("--screen-page-width", `${cardWidth}px`);
    target.style.setProperty("--screen-page-height", `${cardHeight}px`);
  });

  requestAnimationFrame(() => {
    document.querySelectorAll(".card-frame").forEach((frame) => {
      const availableWidth = frame.clientWidth;
      const scale = availableWidth > 0 ? availableWidth / cardWidth : 1;
      frame.style.setProperty("--preview-scale", scale.toFixed(4));
      frame.style.height = `${cardHeight * scale}px`;
    });

    document.querySelectorAll(".extra-frame").forEach((frame) => {
      const availableWidth = frame.clientWidth;
      const scale = availableWidth > 0 ? availableWidth / extraWidth : 1;
      frame.style.setProperty("--preview-scale", scale.toFixed(4));
      frame.style.height = `${extraHeight * scale}px`;
    });
  });
}

function generateCards() {
  const items = parseItems(inputs.items.value);
  updateListHelp();
  const requestedCount = Math.min(Math.max(Number(inputs.count.value) || 1, 1), 100);
  inputs.count.value = requestedCount;

  if (items.length < 24) {
    cardsContainer.replaceChildren();
    extrasContainer.replaceChildren();
    renderHelpfulChecks([]);
    cardTotal.textContent = "0 cards";
    setStatus(items.length === 0
      ? "Paste your bingo list to get started."
      : "Add at least 24 unique list items for a 5 x 5 card with one free square.",
    true);
    return;
  }

  const cards = makeUniqueCards(items, requestedCount);
  renderCards(cards);
  renderExtras(items);
  renderHelpfulChecks(getHelpfulChecks(items, requestedCount));

  const note = cards.length === requestedCount
    ? `Generated ${cards.length} unique card${cards.length === 1 ? "" : "s"} from ${items.length} items.`
    : `Generated ${cards.length} unique cards before combinations ran out. Add more items for more variety.`;
  setStatus(note);
  saveSettings();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateCards();
});

inputs.items.addEventListener("input", () => {
  updateListHelp();
  saveSettings();
});

freeImageInput.addEventListener("change", () => {
  const file = freeImageInput.files[0];
  if (!file) {
    freeImageData = "";
    generateCards();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    freeImageData = reader.result;
    generateCards();
  });
  reader.readAsDataURL(file);
});

schemeGrid.addEventListener("change", (event) => {
  if (event.target.name === "scheme") {
    document.body.dataset.scheme = event.target.value;
    const [primary, highlight, title, occasion] = schemeColors[event.target.value];
    primaryColor.value = primary;
    highlightColor.value = highlight;
    titleColor.value = title;
    occasionColor.value = occasion;
    document.body.dataset.customColors = "false";
    applyCurrentColors();
    saveSettings();
  }
});

[primaryColor, highlightColor, titleColor, occasionColor].forEach((control) => {
  control.addEventListener("input", () => {
    updateCustomColors();
    saveSettings();
  });
});

[fontStyle, occasionFont, gridStyle, pageSize, cardsPerPage].forEach((control) => {
  control.addEventListener("change", () => {
    updateDesignSettings();
    saveSettings();
  });
});

cardsPerPage.addEventListener("change", generateCards);

[inputs.includeInstructions, inputs.includeMasterList, inputs.includeMarkers].forEach((control) => {
  control.addEventListener("change", generateCards);
});

[occasionSize, titleSize].forEach((control) => {
  control.addEventListener("input", () => {
    updateDesignSettings();
    saveSettings();
  });
});

[inputs.occasion, inputs.title, inputs.count, inputs.freeText].forEach((control) => {
  control.addEventListener("input", saveSettings);
});

printButton.addEventListener("click", () => {
  updateDesignSettings();
  generateCards();
  requestAnimationFrame(() => window.print());
});

window.addEventListener("resize", updatePreviewScale);

document.body.dataset.scheme = "party";
restoreSettings();
applyCurrentColors();
updateDesignSettings();
updateListHelp();
generateCards();
