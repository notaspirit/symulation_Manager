const os = require('os');
const path = require('path');
const fs = require('fs');

function getAppDataDir() {
  const homeDir = os.homedir();

  switch (os.platform()) {
    case 'win32':
      return process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
    case 'darwin':
      return path.join(homeDir, 'Library', 'Application Support');
    case 'linux':
      return path.join(homeDir, '.config');
    default:
      throw new Error('Unsupported platform');
  }
}

function getSymulationDir() {
    const appDataDir = getAppDataDir();
    let symulationDir = path.join(appDataDir, 'symulation\\');
    if (!fs.existsSync(symulationDir)) {
      fs.mkdirSync(symulationDir, { recursive: true });
    }
    return symulationDir;
}

function saveSymLink(originPath, targetPath, type) {
  const symulationDir = getSymulationDir();
  let settingsPath = path.join(symulationDir, 'settings.json');
  
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, '[]');
  }
  
  let settingsJsonRAW = fs.readFileSync(settingsPath, 'utf8');
  let settingsJson = JSON.parse(settingsJsonRAW);

  // Determine the next ID
  let nextId = 1;
  if (settingsJson.length > 0) {
    const ids = settingsJson.map(entry => entry.id);
    nextId = Math.max(...ids) + 1;
  }

  // Add the new entry with the next ID
  settingsJson.push({ id: nextId, originPath, targetPath, type });

  fs.writeFileSync(settingsPath, JSON.stringify(settingsJson, null, 2));
}

function deleteSymLink(targetPath) {
  const symulationDir = getSymulationDir();
  let settingsPath = path.join(symulationDir, 'settings.json');
  
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, '[]');
  }
  
  let settingsJsonRAW = fs.readFileSync(settingsPath, 'utf8');
  let settingsJson = JSON.parse(settingsJsonRAW);
  
  // Filter out the entry with the matching targetPath
  const updatedSettingsJson = settingsJson.filter(entry => entry.targetPath !== targetPath);
  
  // Write back only if there are changes
  if (settingsJson.length !== updatedSettingsJson.length) {
    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettingsJson, null, 2));
  }
}

function newSymLinkFile(originPath, targetPath) {
  try {
    // Ensure the directory for the target path exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Create the symlink
    fs.symlinkSync(originPath, targetPath);
    saveSymLink(originPath, targetPath, 'file');
  } catch (error) {
    console.error('Error creating file symlink:', error);
  }
}

function newSymLinkDir(originPath, targetPath) {
  try {
    // Ensure the directory for the target path exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Create the symlink
    fs.symlinkSync(originPath, targetPath, 'dir');
    saveSymLink(originPath, targetPath, 'dir');
  } catch (error) {
    console.error('Error creating directory symlink:', error);
  }
}

function listSymLinks() {
  const symulationDir = getSymulationDir();
  let settingsPath = path.join(symulationDir, 'settings.json');
  let settingsJsonRAW = fs.readFileSync(settingsPath, 'utf8');
  let settingsJson = JSON.parse(settingsJsonRAW);
  console.log(settingsJson);
}

function delSymLinkFileById(id) {
    try {
      const symulationDir = getSymulationDir();
      let settingsPath = path.join(symulationDir, 'settings.json');
      let settingsJsonRAW = fs.readFileSync(settingsPath, 'utf8');
      let settingsJson = JSON.parse(settingsJsonRAW);
  
      console.log('Current settings:', settingsJson); // Debugging: Log current settings
  
      // Find the index of the entry with the specified ID
      const entryIndex = settingsJson.findIndex(entry => entry.id == id);
      if (entryIndex != -1) {
        const entry = settingsJson[entryIndex];  
        // Use fs.unlinkSync to delete the target file or symlink
        fs.unlinkSync(entry.targetPath);
        // Remove the entry from the JSON array
        settingsJson.splice(entryIndex, 1);
        // Write the updated JSON array back to the file
        fs.writeFileSync(settingsPath, JSON.stringify(settingsJson, null, 2));
        console.log(`Symlink or file with ID ${id} deleted successfully.`);
      } else {
        console.error('No symlink found with the specified ID.');
      }
    } catch (error) {
      console.error('Error deleting symlink or file:', error);
    }
}

module.exports = {
  getAppDataDir,
  getSymulationDir,
  newSymLinkFile,
  newSymLinkDir,
  listSymLinks, 
  delSymLinkFileById,
};
