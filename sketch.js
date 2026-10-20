let pokemonList = []

function preload() {
  let table = loadTablele("data/pokemon.csv", "csv", "header");
  pokemonList = convertTableToPokemon(table);
}

function setup() {
  createCanvas(900, 600);
  initializePokedex();
}

function draw() {
  background(220);
  drawPokedex();
}

function drawPokedex() {

}

function initializePokedex() {

}

function convertTableToPokemon(table) {
  return table.rows.map(row => ({
    dexNumber: row.getNum("national_dex_number"),
    name: row.getString("english_name"),
    classification: row.getString("classification"),

    types: {
      primary: row.getString("type_1"),
      secondary: getOptionalString(row, "type_2")
    },

    height: row.getNum("height"),
    weight: row.getNum("weight"),

    stats: {
      hp: row.getNum("hp"),
      attack: row.getNum("atk"),
      defense: row.getNum("def"),
      specialAttack: row.getNum("spatk"),
      specialDefense: row.getNum("spdef"),
      speed: row.getNum("speed")
    }
  }));
}

function getOptionalString(row, columnName) {
  let value = row.getString(columnName);

  if (value === "" || value == "N/A" || value === "null") {
    return null;
  }

  return value;
}