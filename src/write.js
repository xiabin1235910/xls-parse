import sqlite3db from 'sqlite3';

const sqlite3 = sqlite3db.verbose();
const db = new sqlite3.Database('sqlite3_xls.db');

const promises = [];
db.each("select company_code, year, group_code, round(avg(age), 1) as avgs from lorem group by year, group_code, company_code", (err, row) => {
    console.log(row);
    promises.push(writer.addData('ages', row));
});

let writer = new ExcelWriter({
    sheets: [{
        name: 'sheet1',
        key: 'ages',
        headers: [{
            name: 'company_code',
            key: 'company_code'
        }, {
            name: 'year',
            key: 'year',
        }, {
            name: 'group_code',
            key: 'group_code',
        }, {
            name: 'avgs',
            key: 'avgs'
        }]
    }]
});
// let dataPromises = inputs.map((input) => {
//     // 'tests' is the key of the sheet. That is used
//     // to add data to only the Test Sheet
//     writer.addData('ages', input);
// });
setTimeout(() => {
    Promise.all(promises)
        .then(() => {
            return writer.save();
        })
        .then((stream) => {
            stream.pipe(fs.createWriteStream('data.xlsx'));
        });
}, 0)