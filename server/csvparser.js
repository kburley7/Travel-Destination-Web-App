const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'europe-destinations.csv');

function parseCSV(rowId = null) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('File reading error:', err);
                reject(err);
                return;
            }

            const rows = data.split('\n').filter(row => row.trim() !== '');
            const headers = rows[0].replace('\ufeff', '').split(',');

            // If rowId is provided, fetch only that row; otherwise, fetch all rows
            let destinations;

            if (rowId !== null) {
                const row = rows[rowId]; // Fetch row based on index
                if (!row) {
                    resolve(null); // Row doesn't exist
                    return;
                }

                const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                const destination = {};

                headers.forEach((header, index) => {
                    destination[header.trim()] = values[index] ? values[index].replace(/(^"|"$)/g, '').trim() : null;
                });

                destinations = destination;
            } else {
                destinations = rows.slice(1).map(row => {
                    const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                    const destination = {};

                    headers.forEach((header, index) => {
                        destination[header.trim()] = values[index] ? values[index].replace(/(^"|"$)/g, '').trim() : null;
                    });

                    return destination;
                });
            }

            resolve(destinations);
        });
    });
}

module.exports = { parseCSV };