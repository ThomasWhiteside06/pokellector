const fs = require("fs");

async function generate() {
  const pokemon = [];

  for (let id = 1; id <= 1025; id++) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();

    const generation =id <= 151 ? 1 : id <= 251 ? 2 : id <= 386 ? 3 : id <= 493 ? 4 : id <= 649 ? 5 : id <= 721 ? 6 : id <= 809 ? 7 : id <= 905 ? 8 : 9;
    const region =
    id <= 151 ? ["kanto"] :
    id <= 251 ? ["johto"] :
    id <= 386 ? ["hoenn"] :
    id <= 493 ? ["sinnoh"] :
    id <= 649 ? ["unova"] :
    id <= 721 ? ["kalos"] :
    id <= 809 ? ["alola"] :
    id <= 898 ? ["galar"] :
    id <= 905 ? ["hisui"] :
    ["paldea"];

    pokemon.push({
      id: data.id,
      types: data.types.map(t => t.type.name),
      generation: generation,
      region: region
    });

    console.log(`Fetched ${id}/1025`);
  }

  fs.writeFileSync(
    "pokemon-info.json",
    JSON.stringify(pokemon, null, 2)
  );

  console.log("Done!");
}

generate();