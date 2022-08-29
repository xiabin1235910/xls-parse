import xlsx from 'node-xlsx';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import * as fs from 'fs';
import { ExcelReader } from 'node-excel-stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Or var xlsx = require('node-xlsx').default;

// Parse a file
const workSheetsFromFile = xlsx.parse(`${__dirname}/source/relationship.xlsx`);

const map = new Map();

function digitsFor6(digit) {
    let result = digit;
    for (let i = (digit + '').length; i < 6; i++) {
        result = `0${result}`;
    }
    return result;
}

for (let val of workSheetsFromFile[0].data) {
    // company id
    if (map.has(digitsFor6(val[0]))) { // val[0] should to be 6 digits
        const temp = map.get(digitsFor6(val[0]));
        if (temp.buffer.has(val[1])) {
            continue;
        } else {
            temp.buffer.add(val[1]);
            temp.value = `${temp.value};${val[1]}`
        }

    } else {
        const bufferSet = new Set();
        bufferSet.add(val[1]);

        map.set(digitsFor6(val[0]), {
            buffer: bufferSet,
            value: val[1]
        })
    }

    // bufferSet.add(val[4]);
    // console.log(new Date(Math.round((val[2] - 25569) * 86400 * 1000)));
}

// console.log(map.keys())
// console.log(workSheetsFromFile)

let dataStream = fs.createReadStream(`${__dirname}/source/temp.xlsx`);
let reader = new ExcelReader(dataStream, {
    sheets: [{
        name: 'sheet1',
        rows: {
            headerRow: 1,
            allowedHeaders: [{
                name: 'Stkcd',
                key: 'companyId'
            }, {
                name: 'Reptdt',
                key: 'date'
            }, {
                name: 'Name',
                key: 'name',
            }, {
                name: 'Gender',
                key: 'gender'
            }, {
                name: 'Age',
                key: 'age'
            }, {
                name: 'Position',
                key: 'position'
            }]
        }
    }]
})


import sqlite3db from 'sqlite3';

const sqlite3 = sqlite3db.verbose();
const db = new sqlite3.Database('sqlite3_xls.db');

db.serialize(() => {
    // db.run("CREATE TABLE lorem (info TEXT)");
    db.run(`
        CREATE TABLE lorem (
            name TEXT not null,
            age INTEGER not null,
            group_code INTEGER not null,
            company_code TEXT not null,
            year TEXT not null);
        `)

    // const stmt = db.prepare("INSERT INTO lorem VALUES (?, ?, ?, ?, ?)");

    console.log('starting parse');
    reader.eachRow((rowData, rowNum, sheetSchema) => {

        if (!rowData.age) return;

        if (map.has(rowData.companyId)) {
            const r = map.get(rowData.companyId);

            // whether name is the relationship name
            let finalGroup = 0; // no relationship
            if (r.value.match(rowData.name)) {
                finalGroup = 1;
            }
            console.log(rowData.name, rowData.age, finalGroup, rowData.companyId, rowData.date);
            // stmt.run(rowData.name, rowData.age, finalGroup, rowData.companyId, rowData.date);

            db.run("INSERT INTO lorem VALUES (?, ?, ?, ?, ?)", [
                rowData.name, rowData.age, finalGroup, rowData.companyId, rowData.date
            ])
        } else {
            console.log(rowData.name, rowData.age, 0, rowData.companyId, rowData.date);
            // stmt.run(rowData.name, rowData.age, 0, rowData.companyId, rowData.date);
            db.run("INSERT INTO lorem VALUES (?, ?, ?, ?, ?)", [
                rowData.name, rowData.age, 0, rowData.companyId, rowData.date
            ])
        }
    }).then(() => {
        console.log('done parsing');

        // stmt.finalize();

        db.each("select company_code, year, group_code, round(avg(age), 1) from lorem group by year, group_code, company_code", (err, row) => {
            console.log(row);
        });
    }).finally(() => {
        db.close();
    })

    // db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
    //     console.log(row.id + ": " + row.info);
    // });
});




// // Parse a file
// const workSheetsFromTMT = xlsx.parse(`${__dirname}/source/tmt.xlsx`);

// console.log(workSheetsFromTMT)

// for (let val of workSheetsFromTMT[0].data) {
//     // company id
//     if (map.has(val[0])) {
//         const r = map.get(val[0]);

//         // whether name is the relationship name
//         if (r.value.match(val[3])) {
//             console.log(`relationship --- ${val[0]}, ${val[1]}, ${val[3]}, ${val[10]}`);
//         } else {
//             console.log(`none-relationship --- ${val[0]}, ${val[1]}, ${val[3]}, ${val[10]}`);
//         }
//     }
// }


