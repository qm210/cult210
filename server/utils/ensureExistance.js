const fs = require('fs');

module.exports = (file, initFile) => {
    if (!fs.existsSync(file)) {
        fs.copyFile(initFile, file, err => {
            if (err) throw err;
            console.log(`INIT ${file} from ${initFile}`);
        });
    }
};
