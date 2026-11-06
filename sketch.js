// ==================================================
// POKÉDEX UI
// ==================================================

// ==================================================
// 1. LAYOUT
// ==================================================

const layout = {
  pokedex: {
    x: 50,
    y: 50,
    width: 800,
    height: 600,
  },

  margin: 25,

  screen: {
    width: 330,

    main: {
      y: 130,
      height: 220,
    },

    title: {
      y: 70,
      height: 40,
    },

    description: {
      y: 430,
      height: 150,
    },

    stats: {
      y: 175,
      height: 220,

      // Adjust these until the polygon lines up with the background hexagon
      chartCenterX: 101,
      chartCenterY: 106,
      chartRadius: 70,

      barsX: 185,
      barsY: 28,
      barWidth: 85,
      barHeight: 12,
      barGap: 28,
    },

    rightTop: {
      y: 70,
      height: 70,
      gap: 20,
      panelWidth: 155,
    },

    bottom: {
      y: 430,
      height: 150,
      gap: 20,
      speakerRatio: 2 / 3,
      speakerMargin: 15,

      cryButton: {
        centerX: 735,
        size: 80,
      },
    },
  },

  list: {
    width: 210,
    height: 35,
    gap: 6,
    strokeWeight: 2,
    visibleItems: 4,
    extraItems: 1,

    scrollbar: {
      topMargin: 8,
      bottomMargin: 8,
      width: 8,
      gap: 48,
      minimumThumbHeight: 18,
    },

    platform: {
      width: 24,
      height: 8,
      xOffset: -6,
      yOffset: 6,
      spriteYOffset: 8,
    },
  },

  buttons: {
    y: 370,
    height: 40,
    gap: 20,

    back: {
      width: 40,
    },

    select: {
      width: 140,
    },

    forward: {
      width: 40,
    },
  },
};

// ==================================================
// 2. COLORS
// ==================================================

const colors = {
  screen: "#EEA476",
  cell: "#ED9E47",
  outline: "#F2B76F",
  canvas: "#85CDE5",
  shell: "#CC0000",

  text: "#FFFFFF",
  highlight: "#FFD166",
  highlightText: "#5F7185",
  textStroke: "#615e48",
  listHighlightText: "#F2BB74",
  listHighlightTextStroke: "#8A4F5C",

  listCellFill: "#ED9E47",
  listCellBorder: "#F2B76F",
  listCellText: "#FFFFFF",
  listCellTextStroke: "#FCF3BA",

  platformFill: "#F5C857",
  platformBorder: "#F9E066",

  infoCell: "#F5C857",
  infoCellBorder: "#F9E066",

  scrollbarBorder: "#F2B76F",

  button: "#F6D98B",
  buttonHover: "#FFE8A8",
  buttonOutline: "#D6A84F",

  normal: "#A8A87D",
  fire: "#E18644",
  water: "#708FE9",
  grass: "#90C967",
  electric: "#F8CF5C",
  ice: "#A6D6D7",
  fighting: "#BD5C52",
  poison: "#974B9E",
  ground: "#CAA164",
  flying: "#A794EA",
  psychic: "#E97294",
  bug: "#B1BC4F",
  rock: "#B7A552",
  ghost: "#78679D",
  dragon: "#6B3DEF",
  dark: "#6D5A4C",
  steel: "#B9B9CF",
  fairy: "#E29DAC",

  statColors: {
    hp: "#CC424C",
    attack: "#BB9B34",
    defense: "#E17631",
    speed: "#46998C",
    specialAttack: "#31549B",
    specialDefense: "#D247A0",
  },
  radarColor: "#F9E667",
  radarBorder: "#C8A83A",
};

// ==================================================
// ASSET PATHS
// ==================================================

const assetPaths = {
  ui: {
    mainScreen: "images/ui/main_screen.PNG",
    descriptionScreen: "images/ui/desc_screen.PNG",
    statScreen: "images/ui/stat_screen.PNG",
    speaker: "images/ui/speaker.png",
    cryIcon: "images/ui/cry.png",
  },

  pokemon: {
    menuFolder: "images/pokemon/menu/",
    detailFolder: "images/pokemon/detail/",
  },

  criesFolder: "sounds/cries/",
  font: "fonts/PixelifySans-VariableFont_wght.ttf",
};

// ==================================================
// 3. ASSETS AND PROGRAM STATE
// ==================================================

let pokemonList = [];

let mainImage;
let descImage;
let statImage;
let speakerImage;
let customFont;
let cryIcon;

let menuSpriteCache = {};
let detailSpriteCache = {};

const MAX_POKEMON = 151;

let currentScreen = "list";
let highlightedIndex = 0;
let visibleStartIndex = 0;
let selectedPokemonIndex = null;

let currentCry = null;
let loadedCryIndex = null;
const CRIES_ENABLED = false;

// ==================================================
// 4. P5.JS FUNCTIONS
// ==================================================

function preload() {
  // Only required data is loaded during preload.
  loadTable("data/pokemon.csv", "csv", "header", tableLoaded, tableFailed);
}

function setup() {
  createCanvas(900, 600);

  // Use a fallback font immediately.
  textFont("Arial");

  // Optional assets load after the sketch starts.
  loadOptionalAssets();
}

function loadOptionalAssets() {
  mainImage = loadImage(assetPaths.ui.mainScreen, null, assetLoadFailed);

  descImage = loadImage(assetPaths.ui.descriptionScreen, null, assetLoadFailed);

  statImage = loadImage(assetPaths.ui.statScreen, null, assetLoadFailed);

  speakerImage = loadImage(assetPaths.ui.speaker, null, assetLoadFailed);

  cryIcon = loadImage(assetPaths.ui.cryIcon, null, assetLoadFailed);

  loadFont(assetPaths.font, fontLoaded, fontLoadFailed);
}

function fontLoaded(font) {
  customFont = font;
  textFont(customFont);
}

function assetLoadFailed(error) {
  console.warn("Optional asset is not available yet:", error);
}

function fontLoadFailed(error) {
  customFont = null;
  console.warn("Custom font is not available yet:", error);
}

function draw() {
  background(colors.canvas);

  drawPokedex();

  // Draw the main screen and its contents
  drawMainScreen();

  if (currentScreen === "list") {
    drawListCells();

    // Masks cover the overflowing cells
    drawTemporaryMasks();

    drawListScrollbar();

    // Border must be drawn after the masks
    drawMainScreenBorder();
  }

  if (currentScreen === "details") {
    drawSelectedPokemon();
  }

  // Other UI panels
  drawTitleUI();
  drawDescScreen();
  drawTypeUI();
  drawHeightWeightUI();
  drawStatScreen();
  drawSpeaker();
  drawCryButton();
  drawButtons();
}

// ==================================================
// 5. CSV DATA
// ==================================================

function tableLoaded(table) {
  pokemonList = convertTableToPokemon(table);
  pokemonList = pokemonList.slice(0, MAX_POKEMON);

  console.log("Pokémon loaded:", pokemonList.length);
}

function tableFailed(error) {
  console.error("CSV failed to load:", error);
}

function convertTableToPokemon(table) {
  return table.rows.map(function (row) {
    return {
      dexNumber: row.getNum("national_number"),
      name: row.getString("english_name"),
      classification: row.getString("classification"),
      description: row.getString("description"),

      types: {
        primary: formatType(row.getString("primary_type")),
        secondary: formatType(getOptionalString(row, "secondary_type")),
      },

      height: row.getNum("height_m"),
      weight: row.getNum("weight_kg"),

      stats: {
        hp: row.getNum("hp"),
        attack: row.getNum("attack"),
        defense: row.getNum("defense"),
        specialAttack: row.getNum("sp_attack"),
        specialDefense: row.getNum("sp_defense"),
        speed: row.getNum("speed"),
      },
    };
  });
}

function getOptionalString(row, columnName) {
  let value = row.getString(columnName);

  if (value === "" || value === "N/A" || value === "null") {
    return null;
  }

  return value;
}

function formatType(type) {
  if (type === null || type === "") {
    return null;
  }

  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function getHighlightedPokemon() {
  if (highlightedIndex < 0 || highlightedIndex >= pokemonList.length) {
    return null;
  }

  return pokemonList[highlightedIndex];
}

function getSelectedPokemon() {
  if (
    selectedPokemonIndex === null ||
    selectedPokemonIndex < 0 ||
    selectedPokemonIndex >= pokemonList.length
  ) {
    return null;
  }

  return pokemonList[selectedPokemonIndex];
}

function getPokemonFileName(pokemon) {
  return `${nf(pokemon.dexNumber, 3)}.png`;
}

function getMenuSprite(pokemon) {
  let dexNumber = pokemon.dexNumber;

  if (!menuSpriteCache[dexNumber]) {
    let path = assetPaths.pokemon.menuFolder + getPokemonFileName(pokemon);

    menuSpriteCache[dexNumber] = loadImage(path, null, assetLoadFailed);
  }

  return menuSpriteCache[dexNumber];
}

function getDetailSprite(pokemon) {
  let dexNumber = pokemon.dexNumber;

  if (!detailSpriteCache[dexNumber]) {
    let path = assetPaths.pokemon.detailFolder + getPokemonFileName(pokemon);

    detailSpriteCache[dexNumber] = loadImage(path, null, assetLoadFailed);
  }

  return detailSpriteCache[dexNumber];
}

// ==================================================
// 6. NAVIGATION
// ==================================================

function selectOrReturn() {
  if (currentScreen === "list") {
    selectedPokemonIndex = highlightedIndex;
    currentScreen = "details";
  } else {
    selectedPokemonIndex = null;
    currentScreen = "list";
  }
}

function moveHighlightUp() {
  if (highlightedIndex <= 0) {
    return;
  }

  highlightedIndex--;

  // Keep the details screen synchronized with the highlighted Pokémon.
  if (currentScreen === "details") {
    selectedPokemonIndex = highlightedIndex;
  }

  if (highlightedIndex < visibleStartIndex) {
    visibleStartIndex--;
  }
}

function moveHighlightDown() {
  if (highlightedIndex >= pokemonList.length - 1) {
    return;
  }

  highlightedIndex++;

  // Keep the details screen synchronized with the highlighted Pokémon.
  if (currentScreen === "details") {
    selectedPokemonIndex = highlightedIndex;
  }

  if (highlightedIndex >= visibleStartIndex + layout.list.visibleItems) {
    visibleStartIndex++;
  }
}

function keyPressed() {
  if (key === "a" || key === "A") {
    moveHighlightUp();
  }

  if (key === "d" || key === "D") {
    moveHighlightDown();
  }

  if (key === "Enter") {
    selectOrReturn();
  }
}

// ==================================================
// 7. POSITION AND DRAWING HELPERS
// ==================================================

function getLeftX() {
  return layout.pokedex.x + layout.margin;
}

function getRightX(width) {
  return layout.pokedex.x + layout.pokedex.width - layout.margin - width;
}

function getHeightWeightX() {
  return (
    getRightX(layout.screen.width) +
    layout.screen.rightTop.panelWidth +
    layout.screen.rightTop.gap
  );
}

function drawScreenArea(x, y, width, height, imageToDraw) {
  push();

  imageMode(CORNER);

  if (imageToDraw && imageToDraw.width > 0) {
    image(imageToDraw, x, y, width, height);
  } else {
    fill(colors.screen);
    noStroke();
    rect(x, y, width, height);
  }

  drawScreenBorder(x, y, width, height);

  pop();
}

function drawScreenBorder(x, y, width, height) {
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(x, y, width, height);
}

function darkenColor(colorValue, amount) {
  let originalColor = color(colorValue);
  let black = color("#000000");

  return lerpColor(originalColor, black, amount);
}

// ==================================================
// 8. POKÉDEX SHELL
// ==================================================

function drawPokedex() {
  rectMode(CORNER);

  fill(colors.shell);
  stroke(0);
  strokeWeight(1);

  rect(
    layout.pokedex.x,
    layout.pokedex.y,
    layout.pokedex.width,
    layout.pokedex.height,
  );

  // Center hinge
  rect(
    layout.pokedex.x + layout.pokedex.width / 2 - 20,
    layout.pokedex.y,
    40,
    layout.pokedex.height,
  );
}

// ==================================================
// 9. MAIN SCREEN AND DETAILS
// ==================================================

function drawMainScreen() {
  drawScreenArea(
    getLeftX(),
    layout.screen.main.y,
    layout.screen.width,
    layout.screen.main.height,
    mainImage,
  );
}

function drawMainScreenBorder() {
  drawScreenBorder(
    getLeftX(),
    layout.screen.main.y,
    layout.screen.width,
    layout.screen.main.height,
  );
}

function drawSelectedPokemon() {
  // The detail image follows the currently highlighted Pokémon.
  let pokemon = getHighlightedPokemon();

  if (pokemon === null) {
    return;
  }

  let imageSize = 140;
  let imageX = getLeftX() + (layout.screen.width - imageSize) / 2;

  let imageY =
    layout.screen.main.y + (layout.screen.main.height - imageSize) / 2;

  fill(colors.cell);
  stroke(colors.outline);
  strokeWeight(2);
  rect(imageX, imageY, imageSize, imageSize, 4);

  let detailSprite = getDetailSprite(pokemon);

  if (detailSprite && detailSprite.width > 0) {
    imageMode(CENTER);
    image(
      detailSprite,
      imageX + imageSize / 2,
      imageY + imageSize / 2,
      imageSize,
      imageSize,
    );
    imageMode(CORNER);
  } else {
    fill(colors.text);
    stroke(colors.textStroke);
    strokeWeight(1);
    textSize(17);
    textAlign(CENTER, CENTER);
    text(pokemon.name, imageX + imageSize / 2, imageY + imageSize / 2);
  }

  textAlign(LEFT, BASELINE);
}

function drawListScrollbar() {
  if (pokemonList.length === 0) {
    return;
  }

  let screenX = getLeftX();
  let screenY = layout.screen.main.y;
  let screenHeight = layout.screen.main.height;

  let cellX = getLeftX() + layout.screen.width / 2.5;

  // Place the scrollbar just to the left of the list cells.
  let scrollbarX =
    cellX - layout.list.scrollbar.gap - layout.list.scrollbar.width;

  let trackY = screenY + layout.list.scrollbar.topMargin;

  let trackHeight =
    screenHeight -
    layout.list.scrollbar.topMargin -
    layout.list.scrollbar.bottomMargin;

  let trackWidth = layout.list.scrollbar.width;

  // The thumb represents the visible portion of the list
  let thumbHeight =
    (trackHeight * layout.list.visibleItems) / pokemonList.length;

  thumbHeight = max(thumbHeight, layout.list.scrollbar.minimumThumbHeight);

  let maximumIndex = pokemonList.length - 1;

  let maximumThumbY = trackY + trackHeight - thumbHeight;

  let scrollAmount = 0;

  if (maximumIndex > 0) {
    scrollAmount = highlightedIndex / maximumIndex;
  }

  let thumbY = trackY + scrollAmount * (maximumThumbY - trackY);

  push();

  // Scrollbar track
  fill(255, 100);
  stroke(colors.scrollbarBorder);
  strokeWeight(2);
  rect(scrollbarX, trackY, trackWidth, trackHeight, 4);

  // Scrollbar thumb
  fill(colors.highlight);
  stroke(colors.scrollbarBorder);
  strokeWeight(2);
  rect(scrollbarX, thumbY, trackWidth, thumbHeight, 4);

  pop();
}

function drawTitleUI() {
  drawScreenArea(
    getLeftX(),
    layout.screen.title.y,
    layout.screen.width,
    layout.screen.title.height,
    null,
  );

  let pokemon = getHighlightedPokemon();

  if (pokemon === null) {
    return;
  }

  let textY = layout.screen.title.y + layout.screen.title.height / 2;

  fill(colors.text);
  stroke(colors.textStroke);
  strokeWeight(1);
  textSize(19);

  textAlign(LEFT, CENTER);
  text(pokemon.name, getLeftX() + 10, textY);

  textAlign(RIGHT, CENTER);
  text(
    `No. ${nf(pokemon.dexNumber, 3)}`,
    getLeftX() + layout.screen.width - 10,
    textY,
  );

  textAlign(LEFT, BASELINE);
}

function drawDescScreen() {
  drawScreenArea(
    getLeftX(),
    layout.screen.description.y,
    layout.screen.width,
    layout.screen.description.height,
    descImage,
  );

  let pokemon = getHighlightedPokemon();

  if (pokemon === null) {
    return;
  }

  let screenX = getLeftX();
  let screenY = layout.screen.description.y;
  let screenWidth = layout.screen.width;

  // Classification cell
  let classificationText = `The ${pokemon.classification}`;

  drawCenteredLabelCell(
    classificationText,
    screenX + screenWidth / 2,
    screenY + 18,
    screenWidth - 30,
    25,
  );

  // Description text below the classification cell
  fill(colors.text);
  stroke(colors.textStroke);
  strokeWeight(1);
  textAlign(LEFT, TOP);
  textLeading(20);
  textSize(15);

  text(
    pokemon.description,
    screenX + 10,
    screenY + 42,
    screenWidth - 20,
    layout.screen.description.height - 50,
  );

  textAlign(LEFT, BASELINE);
}
function drawStatScreen() {
  let panelX = getRightX(layout.screen.width);
  let panelY = layout.screen.stats.y;

  drawScreenArea(
    panelX,
    panelY,
    layout.screen.width,
    layout.screen.stats.height,
    statImage,
  );

  let pokemon = getHighlightedPokemon();

  if (pokemon === null) {
    return;
  }

  drawRadarChart(pokemon, panelX, panelY);
  drawStatBars(pokemon, panelX, panelY);
}

function drawRadarChart(pokemon, panelX, panelY) {
  let stats = [
    pokemon.stats.hp,
    pokemon.stats.attack,
    pokemon.stats.defense,
    pokemon.stats.speed,
    pokemon.stats.specialDefense,
    pokemon.stats.specialAttack,
  ];

  let centerX = panelX + layout.screen.stats.chartCenterX;

  let centerY = panelY + layout.screen.stats.chartCenterY;

  let radius = layout.screen.stats.chartRadius;
  let maximumStat = 255;

  push();

  // Temporary full-size perimeter
  // noFill();
  // stroke(255, 0, 0);
  // strokeWeight(2);

  // beginShape();

  // for (let i = 0; i < stats.length; i++) {
  //   let angle = -HALF_PI + (i * TWO_PI) / stats.length;

  //   let pointX = centerX + cos(angle) * radius;

  //   let pointY = centerY + sin(angle) * radius;

  //   vertex(pointX, pointY);
  // }

  // endShape(CLOSE);

  // Actual Pokémon stat polygon
  let radarFill = color(colors.radarColor);
  radarFill.setAlpha(120);

  fill(radarFill);
  stroke(colors.radarBorder);
  strokeWeight(1.5);

  beginShape();

  for (let i = 0; i < stats.length; i++) {
    let angle = -HALF_PI + (i * TWO_PI) / stats.length;

    let statAmount = constrain(stats[i] / maximumStat, 0, 1);

    let pointX = centerX + cos(angle) * radius * statAmount;

    let pointY = centerY + sin(angle) * radius * statAmount;

    vertex(pointX, pointY);
  }

  endShape(CLOSE);

  pop();
}

function drawStatBars(pokemon, panelX, panelY) {
  let statNames = ["HP", "ATK", "DEF", "SPD", "SpD", "SpA"];

  let statValues = [
    pokemon.stats.hp,
    pokemon.stats.attack,
    pokemon.stats.defense,
    pokemon.stats.speed,
    pokemon.stats.specialDefense,
    pokemon.stats.specialAttack,
  ];

  let statBarColors = [
    colors.statColors.hp,
    colors.statColors.attack,
    colors.statColors.defense,
    colors.statColors.speed,
    colors.statColors.specialDefense,
    colors.statColors.specialAttack,
  ];

  let barX = panelX + layout.screen.stats.barsX;

  let firstBarY = panelY + layout.screen.stats.barsY;

  let maximumStat = 255;

  push();

  textSize(13);
  textAlign(LEFT, CENTER);

  for (let i = 0; i < statValues.length; i++) {
    let barY = firstBarY + i * layout.screen.stats.barGap;

    let value = statValues[i];

    let filledWidth = map(
      value,
      0,
      maximumStat,
      0,
      layout.screen.stats.barWidth,
    );

    // Stat label
    fill(colors.text);
    stroke(colors.textStroke);
    strokeWeight(1);

    text(statNames[i], barX, barY + layout.screen.stats.barHeight / 2);

    let actualBarX = barX + 28;

    // Draw the bar fills without borders
    noStroke();

    fill(255, 255, 255, 120);
    rect(
      actualBarX,
      barY,
      layout.screen.stats.barWidth,
      layout.screen.stats.barHeight,
      3,
    );

    fill(statBarColors[i]);
    rect(actualBarX, barY, filledWidth, layout.screen.stats.barHeight, 3);

    // Draw the border on top of both fills
    noFill();
    stroke(colors.textStroke);
    strokeWeight(1);

    rect(
      actualBarX,
      barY,
      layout.screen.stats.barWidth,
      layout.screen.stats.barHeight,
      3,
    );

    // Stat number
    fill(colors.text);
    stroke(colors.textStroke);
    strokeWeight(1);

    text(
      value,
      actualBarX + layout.screen.stats.barWidth + 6,
      barY + layout.screen.stats.barHeight / 2,
    );
  }

  textAlign(LEFT, BASELINE);

  pop();
}

// ==================================================
// 10. TYPE AND PHYSICAL INFORMATION
// ==================================================

function drawTypeUI() {
  let panelX = getRightX(layout.screen.width);
  let panelY = layout.screen.rightTop.y;
  let panelWidth = layout.screen.rightTop.panelWidth;
  let panelHeight = layout.screen.rightTop.height;

  drawScreenArea(panelX, panelY, panelWidth, panelHeight, null);

  let pokemon = getHighlightedPokemon();

  if (pokemon === null) {
    return;
  }

  let headerHeight = 26;
  let typeHeight = 18;
  let gap = 4;

  // Total height of the complete group
  let totalGroupHeight = headerHeight + gap + typeHeight;

  // Center the complete group vertically
  let groupTop = panelY + (panelHeight - totalGroupHeight) / 2;

  let headerY = groupTop;
  let typeY = headerY + headerHeight + gap;

  // Types header
  drawCenteredLabelCell(
    "Types",
    panelX + panelWidth / 2,
    headerY + headerHeight / 2,
    110,
    headerHeight,
  );

  let typeWidth = 65;
  let typeCount = 1;

  if (pokemon.types.secondary !== null) {
    typeCount = 2;
  }

  let totalTypeWidth = typeCount * typeWidth + (typeCount - 1) * gap;

  let firstTypeX = panelX + (panelWidth - totalTypeWidth) / 2;

  // Primary type
  drawTypeCell(pokemon.types.primary, firstTypeX, typeY, typeWidth, typeHeight);

  // Secondary type
  if (pokemon.types.secondary !== null) {
    drawTypeCell(
      pokemon.types.secondary,
      firstTypeX + typeWidth + gap,
      typeY,
      typeWidth,
      typeHeight,
    );
  }
}

function drawCenteredLabelCell(label, centerX, centerY, width, height) {
  rectMode(CENTER);

  fill(colors.infoCell);
  stroke(colors.infoCellBorder);
  strokeWeight(1);
  rect(centerX, centerY, width, height, 3);

  fill(colors.text);
  stroke(colors.textStroke);
  strokeWeight(1);
  textSize(21);
  textAlign(CENTER, CENTER);
  text(label, centerX, centerY - 2);

  rectMode(CORNER);
  textAlign(LEFT, BASELINE);
}

function drawTypeCell(type, x, y, width, height) {
  let typeColor = colors[type.toLowerCase()] || colors.normal;

  fill(typeColor);
  stroke(colors.text);
  strokeWeight(1);
  rect(x, y, width, height, 4);

  fill(colors.text);
  noStroke();
  textSize(13);
  textAlign(CENTER, CENTER);

  // Move the type text slightly upward
  text(type, x + width / 2, y + height / 2 - 2);

  textAlign(LEFT, BASELINE);
}

function drawHeightWeightUI() {
  let panelX = getHeightWeightX();
  let panelY = layout.screen.rightTop.y;
  let panelWidth = layout.screen.rightTop.panelWidth;
  let panelHeight = layout.screen.rightTop.height;

  drawScreenArea(panelX, panelY, panelWidth, panelHeight, null);

  let pokemon = getHighlightedPokemon();

  if (pokemon === null) {
    return;
  }

  fill(colors.text);
  stroke(colors.textStroke);
  strokeWeight(1);
  textSize(19);
  textAlign(LEFT, CENTER);

  text(`Height: ${pokemon.height} m`, panelX + 10, panelY + 20);

  text(`Weight: ${pokemon.weight} kg`, panelX + 10, panelY + 48);

  textAlign(LEFT, BASELINE);
}

// ==================================================
// 11. LIST CELLS
// ==================================================

function drawListCells() {
  let screenY = layout.screen.main.y;
  let screenHeight = layout.screen.main.height;
  let screenCenterY = screenY + screenHeight / 2;

  let cellStep = layout.list.height + layout.list.gap;

  let visibleListHeight =
    layout.list.visibleItems * layout.list.height +
    (layout.list.visibleItems - 1) * layout.list.gap;

  let firstCellY = screenCenterY - visibleListHeight / 2;

  let cellX = getLeftX() + layout.screen.width / 2.5;

  for (
    let position = -layout.list.extraItems;
    position <= layout.list.visibleItems;
    position++
  ) {
    let pokemonIndex = visibleStartIndex + position;

    if (pokemonIndex < 0 || pokemonIndex >= pokemonList.length) {
      continue;
    }

    let pokemon = pokemonList[pokemonIndex];
    let cellY = firstCellY + position * cellStep;

    let isOffscreen = position < 0 || position >= layout.list.visibleItems;

    let isHighlighted = pokemonIndex === highlightedIndex;

    let cellColor = colors.listCellFill;
    let textColor = colors.listCellText;
    let textStrokeColor = colors.listCellTextStroke;

    if (isHighlighted) {
      cellColor = colors.highlight;
      textColor = colors.listHighlightText;
      textStrokeColor = colors.listHighlightTextStroke;
    } else if (isOffscreen) {
      cellColor = darkenColor(colors.listCellFill, 0.15);
      textColor = darkenColor(colors.listCellText, 0.15);
      textStrokeColor = darkenColor(colors.listCellTextStroke, 0.15);
    }

    fill(cellColor);
    stroke(colors.listCellBorder);
    strokeWeight(layout.list.strokeWeight);
    rect(cellX, cellY, layout.list.width, layout.list.height, 4);

    drawListPlatform(cellX, cellY, isOffscreen);
    drawListSprite(cellX, cellY, pokemon, isOffscreen);

    let textY =
      cellY + layout.list.height / 2 + (textAscent() - textDescent()) / 2;

    fill(textColor);
    stroke(textStrokeColor);
    strokeWeight(1);
    textSize(17);
    textAlign(LEFT, BASELINE);

    text(nf(pokemon.dexNumber, 3), cellX + 10, textY);
    text(pokemon.name, cellX + 55, textY);
  }

  textAlign(LEFT, BASELINE);
}

function drawListSprite(cellX, cellY, pokemon, isOffscreen) {
  let menuSprite = getMenuSprite(pokemon);

  let spriteSize = 30;

  let platformX = cellX + layout.list.platform.xOffset;

  let platformY = cellY + layout.list.height / 2 + layout.list.platform.yOffset;

  let spriteX = platformX - spriteSize / 2;
  let spriteY = platformY - spriteSize + layout.list.platform.spriteYOffset;

  push();

  if (isOffscreen) {
    // Darken the sprite by the same 15% amount as the cells
    tint(255 * 0.85, 255 * 0.85, 255 * 0.85, 255);
  }

  imageMode(CORNER);
  image(menuSprite, spriteX, spriteY, spriteSize, spriteSize);

  pop();
}

// ==================================================
// 12. LIST MASKS
// ==================================================

function drawTemporaryMasks() {
  push();

  noStroke();
  fill(colors.shell);

  let screenX = getLeftX();
  let screenY = layout.screen.main.y;
  let screenWidth = layout.screen.width;
  let screenHeight = layout.screen.main.height;

  let screenRight = screenX + screenWidth;
  let screenBottom = screenY + screenHeight;

  let cellX = getLeftX() + layout.screen.width / 2.5;
  let cellRight = cellX + layout.list.width;

  let platformLeft =
    cellX + layout.list.platform.xOffset - layout.list.platform.width / 2;

  let platformRight =
    cellX + layout.list.platform.xOffset + layout.list.platform.width / 2;
  let cellStep = layout.list.height + layout.list.gap;

  let visibleListHeight =
    layout.list.visibleItems * layout.list.height +
    (layout.list.visibleItems - 1) * layout.list.gap;

  let firstCellY = screenY + screenHeight / 2 - visibleListHeight / 2;

  let topCellY = firstCellY - cellStep;
  let bottomCellY = firstCellY + layout.list.visibleItems * cellStep;
  let bottomCellEnd = bottomCellY + layout.list.height;

  let maskPadding = 2;

  // Hide the part of the top cell above the screen.
  rect(
    platformLeft - maskPadding,
    topCellY - maskPadding,
    cellRight - platformLeft + maskPadding * 2,
    screenY - topCellY + maskPadding,
  );

  // Hide the part of the bottom cell below the screen.
  rect(
    platformLeft - maskPadding,
    screenBottom,
    cellRight - platformLeft + maskPadding * 2,
    bottomCellEnd - screenBottom + maskPadding,
  );

  // Hide cell overflow past the right edge.
  if (cellRight > screenRight) {
    rect(
      screenRight,
      screenY,
      cellRight - screenRight + maskPadding,
      screenHeight,
    );
  }

  pop();
}

// ==================================================
// 13. LOWER-RIGHT UI
// ==================================================

function drawSpeaker() {
  let rightX = getRightX(layout.screen.width);
  let availableWidth = layout.screen.width - layout.screen.bottom.gap;

  let speakerWidth = availableWidth * layout.screen.bottom.speakerRatio;

  let squareSize =
    Math.min(speakerWidth, layout.screen.bottom.height) -
    layout.screen.bottom.speakerMargin * 2;

  let squareX = rightX + (speakerWidth - squareSize) / 2;

  let squareY =
    layout.screen.bottom.y + (layout.screen.bottom.height - squareSize) / 2;

  imageMode(CORNER);

  if (speakerImage && speakerImage.width > 0) {
    image(speakerImage, squareX, squareY, squareSize, squareSize);
  } else {
    fill(colors.screen);
    rect(squareX, squareY, squareSize, squareSize);
  }
}

function drawListPlatform(cellX, cellY, isOffscreen) {
  let platformX = cellX + layout.list.platform.xOffset;

  let platformY = cellY + layout.list.height / 2 + layout.list.platform.yOffset;

  let platformFill = colors.platformFill;
  let platformBorder = colors.platformBorder;

  if (isOffscreen) {
    platformFill = darkenColor(platformFill, 0.15);
    platformBorder = darkenColor(platformBorder, 0.15);
  }

  push();

  ellipseMode(CENTER);
  fill(platformFill);
  stroke(platformBorder);
  strokeWeight(1);

  ellipse(
    platformX,
    platformY,
    layout.list.platform.width,
    layout.list.platform.height,
  );

  pop();
}

function drawCryButton() {
  let button = getCryButtonArea();

  if (isMouseOverCryButton()) {
    fill(colors.buttonHover);
  } else {
    fill(colors.button);
  }

  stroke(colors.buttonOutline);
  strokeWeight(2);

  rect(button.x, button.y, button.width, button.height, 10);

  if (cryIcon && cryIcon.width > 0) {
    imageMode(CENTER);

    let iconSize = button.width * 0.65;

    image(
      cryIcon,
      button.x + button.width / 2,
      button.y + button.height / 2,
      iconSize,
      iconSize,
    );

    imageMode(CORNER);
  } else {
    // Temporary fallback if the icon fails to load
    fill(colors.highlightText);
    stroke(colors.textStroke);
    strokeWeight(1);
    textSize(17);
    textAlign(CENTER, CENTER);

    text("Cry", button.x + button.width / 2, button.y + button.height / 2 - 1);

    textAlign(LEFT, BASELINE);
  }
}

// ==================================================
// 14. BUTTON HIT AREAS
// ==================================================

function getButtonPositions() {
  let totalButtonWidth =
    layout.buttons.back.width +
    layout.buttons.select.width +
    layout.buttons.forward.width +
    layout.buttons.gap * 2;

  let backX = getLeftX() + (layout.screen.width - totalButtonWidth) / 2;

  let selectX = backX + layout.buttons.back.width + layout.buttons.gap;

  let forwardX = selectX + layout.buttons.select.width + layout.buttons.gap;

  return {
    back: {
      x: backX,
      y: layout.buttons.y,
      width: layout.buttons.back.width,
      height: layout.buttons.height,
    },

    select: {
      x: selectX,
      y: layout.buttons.y,
      width: layout.buttons.select.width,
      height: layout.buttons.height,
    },

    forward: {
      x: forwardX,
      y: layout.buttons.y,
      width: layout.buttons.forward.width,
      height: layout.buttons.height,
    },
  };
}

function drawButtons() {
  let buttons = getButtonPositions();

  drawArrowButton(buttons.back, "left");
  drawSelectButton(buttons.select);
  drawArrowButton(buttons.forward, "right");
}

function drawArrowButton(button, direction) {
  let isHovered = isMouseOverButton(button);

  if (isHovered) {
    fill(colors.buttonHover);
  } else {
    fill(colors.button);
  }

  stroke(colors.buttonOutline);
  strokeWeight(2);

  let centerX = button.x + button.width / 2;
  let centerY = button.y + button.height / 2;
  let arrowSize = 14;

  if (direction === "left") {
    triangle(
      centerX - arrowSize,
      centerY,
      centerX + arrowSize / 2,
      centerY - arrowSize,
      centerX + arrowSize / 2,
      centerY + arrowSize,
    );
  } else {
    triangle(
      centerX + arrowSize,
      centerY,
      centerX - arrowSize / 2,
      centerY - arrowSize,
      centerX - arrowSize / 2,
      centerY + arrowSize,
    );
  }
}

function drawSelectButton(button) {
  let isHovered = isMouseOverButton(button);

  if (isHovered) {
    fill(colors.buttonHover);
  } else {
    fill(colors.button);
  }

  stroke(colors.buttonOutline);
  strokeWeight(2);

  rect(button.x + 6, button.y + 6, button.width - 12, button.height - 12, 10);

  let buttonText = "Select";

  if (currentScreen === "details") {
    buttonText = "Return";
  }

  fill(colors.highlightText);
  stroke(colors.textStroke);
  strokeWeight(1);
  textSize(17);
  textAlign(CENTER, CENTER);

  text(
    buttonText,
    button.x + button.width / 2,
    button.y + button.height / 2 - 1,
  );

  textAlign(LEFT, BASELINE);
}

function isMouseOverButton(button) {
  return (
    mouseX >= button.x &&
    mouseX <= button.x + button.width &&
    mouseY >= button.y &&
    mouseY <= button.y + button.height
  );
}

function mousePressed() {
  let buttons = getButtonPositions();

  if (currentScreen === "list") {
    if (isMouseOverButton(buttons.back)) {
      moveHighlightUp();
      return;
    }

    if (isMouseOverButton(buttons.forward)) {
      moveHighlightDown();
      return;
    }

    if (isMouseOverButton(buttons.select)) {
      selectOrReturn();
      return;
    }
  }

  if (currentScreen === "details") {
    if (isMouseOverButton(buttons.select)) {
      selectOrReturn();
      return;
    }
  }

  if (isMouseOverCryButton()) {
    if (CRIES_ENABLED && typeof userStartAudio === "function") {
      userStartAudio();
      playSelectedCry();
    }

    return;
  }
}

function playSelectedCry() {
  if (!CRIES_ENABLED || typeof loadSound !== "function") {
    return;
  }

  let pokemon = getSelectedPokemon();

  if (pokemon === null) {
    return;
  }

  // Stop the previous cry if it is still playing
  if (currentCry !== null && currentCry.isPlaying()) {
    currentCry.stop();
  }

  let dexNumber = nf(pokemon.dexNumber, 3);
  let cryPath = `${assetPaths.criesFolder}${dexNumber}.mp3`;

  currentCry = loadSound(cryPath, cryLoaded, cryFailed);
}

function cryLoaded(sound) {
  if (sound) {
    sound.play();
  }
}

function cryFailed(error) {
  currentCry = null;
}

function getCryButtonArea() {
  let button = layout.screen.bottom.cryButton;
  let size = button.size;

  return {
    x: button.centerX - size / 2,
    y: layout.screen.bottom.y + (layout.screen.bottom.height - size) / 2,
    width: size,
    height: size,
  };
}

function isMouseOverCryButton() {
  let button = getCryButtonArea();

  return (
    mouseX >= button.x &&
    mouseX <= button.x + button.width &&
    mouseY >= button.y &&
    mouseY <= button.y + button.height
  );
}
