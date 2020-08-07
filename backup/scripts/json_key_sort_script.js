const fs = require('fs');

function sortJsonAlphabetically(jsonData) {
    if (jsonData == null)
        return jsonData;
    let newData = {};
    if (Array.isArray(jsonData)) {
        newData = [];
        for (let i = 0; i < jsonData.length; i++) {
            newData[i] = sortJsonAlphabetically(jsonData[i]);
        }
    } else if (typeof jsonData === 'object') {
        const keys = Object.keys(jsonData);
        keys.sort();
        for (const key of keys) {
            newData[key] = sortJsonAlphabetically(jsonData[key]);
        }
    } else {
        return jsonData;
    }
    return newData;
}

function loadJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data))
}

const original = loadJson('original.json');
const newOne = loadJson('new.json');

saveJson('sorted_original.json', sortJsonAlphabetically(original));
saveJson('sorted_new.json', sortJsonAlphabetically(newOne));