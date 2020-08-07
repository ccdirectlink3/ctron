const fs = require('fs');
function loadJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data))
}

const patches = loadJson('patch.json');

let saveName = '';
const names = {};
function generatePatchName(baseName) {
    if (!(baseName in names)) {
        names[baseName] = 1;
    } else {
        names[baseName]++;
    }
    return `${baseName}_patch${names[baseName]}.json`;
}

function generateName(baseName) {
    return `${baseName}.json`;
}




let enterLevel = 0;
let saved = [];
let shouldSave = false;

const merge_patches = [];

for (const patch of patches) {
    if (patch.type === "ENTER") {
        if (enterLevel === 0) {
            const baseName = Array.isArray(patch.index) ? patch.index[0] : patch.index;
            saveName = generatePatchName(baseName);
        }

        enterLevel += Array.isArray(patch.index) ? patch.index.length : 1;
        shouldSave = true; 
    } else if (patch.type === "EXIT") {
        enterLevel -= patch.count || 1;
    }

    if (shouldSave) {
        saved.push(patch);
        shouldSave = enterLevel > 0;
    }

    if (enterLevel === 0) {
        if (saved.length) {
            merge_patches.push({
                type: "INCLUDE",
                src: "mod:patches/data/players/ctron/actions/BASE/" + saveName
            });
            saveJson(saveName, saved);
            saved = [];
        } else if (patch.type === "SET_KEY") {
            const fileName = generateName(patch.index);
            saveJson(fileName, [patch]);
            merge_patches.push({
                type: "INCLUDE",
                src: "mod:patches/data/players/ctron/actions/BASE/" + fileName
            });
        }
    }
}

saveJson('merged.json', merge_patches);