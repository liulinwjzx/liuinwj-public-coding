
const fs = require("fs");
const parse = require("csv-parse/lib/sync");
const Json2csvParser = require('json2csv').Parser;
const appRoot = require("app-root-path");
const DB = appRoot.require("utils/sqlite");


const db = new DB("database.db");

const input = fs.readFileSync("map.csv");
const tables = parse(fs.readFileSync("map.csv"), {
  columns: true,
  skip_empty_lines: true,
});

const handledTables = ["ISO_3166_1", "ISO_3166_1_WITH_CHINESE"];


(async function() {

  for (let table of tables) {

    if (handledTables.length > 0 && !handledTables.includes(table.name)) {
      continue;
    }
    console.log(`Start table: ${table.name}`);

    let folder = `coding/${table.folder}`;
    fs.existsSync(folder) || fs.mkdirSync(folder);
    console.log("\tCreate folder success.");

    for (let f of fs.readdirSync(folder)) {
      if (f === `${table.name}.csv` || f === `${table.name}.json` || f === `${table.name}.db`) {
        fs.unlinkSync(`${folder}/${f}`);
      }
    }
    console.log("\tClean old files success.");

    let readme = `${folder}/readme.md`;
    if (!fs.existsSync(readme)) {
      fs.writeFileSync(readme, "");
      console.log(`\tCreate readme file success.`);
    }

    let data = await db.allAsync(`SELECT * FROM ${table.name}`);
    console.log(`\tRead data success.`);

    fs.writeFileSync(`${folder}/${table.name}.json`, JSON.stringify(data, null, 2));
    console.log(`\tWrite JSON file success.`);

    let csv = new Json2csvParser(Object.keys(data[0])).parse(data);
    fs.writeFileSync(`${folder}/${table.name}.csv`, csv);
    console.log(`\tWrite CSV file success.`);

    let db2Path = `${folder}/${table.name}.db`;
    let db2 = new DB(db2Path);
    await db2.runAsync(`attach database "database.db" as db`);
    await db2.runAsync(`CREATE TABLE ${table.name} AS SELECT * FROM db.${table.name}`);;

    console.log(`\t${table.name} success.`);
  }

  db.close(); 

})();
