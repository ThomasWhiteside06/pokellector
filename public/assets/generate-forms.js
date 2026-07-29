const fs = require("fs");

async function getArtwork(pokemonData) {
  const id = pokemonData.id;
  const name = pokemonData.name;

  const officialArtwork =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  const formSprite =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${name}.png`;

  const homeSprite =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;

  try {
    const officialResponse = await fetch(officialArtwork);
    if (officialResponse.ok) return officialArtwork;

    const homeResponse = await fetch(homeSprite);
    if (homeResponse.ok) return homeSprite;

    const formResponse = await fetch(formSprite);
    if (formResponse.ok) return formSprite;
  } catch (error) {
    console.log(`Artwork failed for ${name}`, error);
  }

  return null;
}

async function generate() {

  const listResponse = await fetch(
    "https://pokeapi.co/api/v2/pokemon-form?limit=2000"
  );

  const list = await listResponse.json();

  const speciesMap = new Map();

  let completed = 0;

  for (const formEntry of list.results) {

    const formResponse = await fetch(formEntry.url);
    const formData = await formResponse.json();

    const pokemonResponse = await fetch(formData.pokemon.url);
    const pokemonData = await pokemonResponse.json();

    const speciesUrl = pokemonData.species.url;
    const speciesId = Number(
      speciesUrl.split("/").filter(Boolean).pop()
    );

    if (!speciesMap.has(speciesId)) {
      speciesMap.set(speciesId, {
        speciesId,
        speciesName: pokemonData.species.name,
        forms: []
      });
    }

    const artwork =
      await getArtwork(pokemonData) ??
      formData.sprites.front_default;

    const shinyArtwork =
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonData.id}.png`;

    const femaleArtwork =
      pokemonData.sprites.other?.home?.front_female ??
      pokemonData.sprites.front_female ??
      undefined;

    const femaleShinyArtwork =
      pokemonData.sprites.other?.home?.front_shiny_female ??
      pokemonData.sprites.front_shiny_female ??
      undefined;

    speciesMap.get(speciesId).forms.push({
      id: formData.id,
      pokemonId: pokemonData.id,
      name: formData.name,
      formName: formData.form_name,
      isDefault: formData.is_default,
      isBattleOnly: formData.is_battle_only,
      isMega: formData.is_mega,
      types: pokemonData.types.map(t => t.type.name),

      artwork,
      shinyArtwork,

      femaleArtwork,
      femaleShinyArtwork,

      hasGenderDifference: !!femaleArtwork
    });

    completed++;

    console.log(
      `${completed}/${list.results.length} ${pokemonData.name} ${
        femaleArtwork ? "✓ female" : ""
      }`
    );

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const output = [...speciesMap.values()]
    .sort((a, b) => a.speciesId - b.speciesId);

  fs.writeFileSync(
    "pokemon-forms.json",
    JSON.stringify(output, null, 2)
  );

  console.log("Finished!");
}

generate().catch(console.error);