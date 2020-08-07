const fs = require('fs');
function saveJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data))
}

function optimizePatches(patches) {
    let lastType = '';
    for (let i = 0; i < patches.length; i++) {
        if (lastType === patches[i].type) {
            if (lastType === 'ENTER') {
                if(!Array.isArray(patches[i - 1].index)) {
                    patches[i - 1].index = [patches[i - 1].index];
                }
                if (!Array.isArray(patches[i].index)) {
                    patches[i].index = [patches[i].index];
                }
                patches[i - 1].index.push(...patches[i].index);
                patches.splice(i, 1);
                i--;
            } else if (lastType === 'EXIT') {
                let previousCount = patches[i - 1].count || 1;
                let currentCount = patches[i].index || 1;
                patches[i - 1].count = previousCount + currentCount;
                patches.splice(i, 1);
                i--;              
            }
        } else {
            lastType = patches[i].type;
        }
    }
}

const merge_patches = [{
    type: "ENTER",
    index: "actions"
}];

function getFiles(path = "./") {
    const entries = fs.readdirSync(path, { withFileTypes: true });

    // Get files within the current directory and add a path key to the file objects
    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => (path.substring(2) + file.name));

    // Get folders within the current directory
    const folders = entries.filter(folder => folder.isDirectory());

    for (const folder of folders)
        files.push(...getFiles(`${path}${folder.name}/`));
    return files;
}

const files = getFiles();

let lastFolder = '';

for (const file of files) {
    if (file.endsWith('merged.json')) {
        if (file.includes('actions')) {
            lastFolder = 'actions';
            merge_patches.push({
                type: "ENTER",
                index: (/actions\/(\w+)\/merged\.json/).exec(file)[1]
            });
        } else if (file.includes('proxies')) {
            if (lastFolder === 'actions') {
                merge_patches.push({
                    type: "EXIT"
                });               
            }
            lastFolder = 'proxies';
            merge_patches.push({
                type: "ENTER",
                index: 'proxies'
            });
        } 

        merge_patches.push({
            type: "INCLUDE",
            src: 'mod:patches/data/players/ctron/' + file
        });

        if (file.includes('actions') || file.includes('proxies')) {
            merge_patches.push({
                type: "EXIT"
            });
        }
    }
}

optimizePatches(merge_patches);

saveJson('player.patch.json', merge_patches);