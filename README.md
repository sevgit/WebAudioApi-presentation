### Live demo files for my Web Audio Api presentation for WyeWorks

## Installing the pedalboard

- Clone the repo
- Run `npm install`


## Building the pedalboard

- Run `npm run build` (will generate a dist folder)

## Running the pedalboard

Currently, you need to serve the `index.html` file through a server so it doesn't complain about CORS on it's requests. I recommend globally installing serve. For this you can:

- Run `npm i -g serve` (will globally install serve)
- Run `serve` on the repo's folder
- Access `http://localhost:5000`


## Identified TODOs!

- Strip out jQuery (not really needed)
- Strip out TypeScript (may lure out curious people with an extra learning curve?)
- Add more effects
- Allow more values to be changed on each effect (i.e tone on distortion, depth on tremolo)
- Tests!
- Allow users to move the pedals around (let them reorder the chain)
