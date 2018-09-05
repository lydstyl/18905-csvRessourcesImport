/**
 * This script is used to transfome a .csv with key and value columns to properties files.
 * Be carreful not to have any space in the column header of your .csv and to add the column name in opts.propertiesLang
 * You have to add the folder propertiesFilesGenerated in the root directory
 * For better result, sort the .csv before using this script.
 * 
 * 
 * Exemple of the .csv file opened in code :
 * 
 * "Key";"es_ES"
 * "//ressource/common/close";"Cerrar"
 * "//ressource/common/close2";"Cerrar2"
 * "//ressource/storelocator/storelocator.internationalmessage";"Los clientes europeos ahora pueden comprar nuestros productos más novedosos en línea. <br />Descubre todas las novedades: <a href=""http://www.demandware.de/"" title=""Deutsche Website"" target=""_blank"">Sitio web en alemán</a>"
 * 
 * 
 * The .csv will become .properties files like this one :
 * 
 * # Made with the Node.js script 18904-csvRessourcesImport <gbrun@altima-agency.com>
 * close1=Cerrar1
 * close2=Cerrar2
 * close3=Cerrar3
 */

const fs = require("fs");
const path = require('path');
const csv = require('csvtojson/v2');
const parser = require("properties-file");

/**
 * Please fill the opts bellow
 */
let opts = { 
    filePath: './csv.csv',
    csvPossibleDelimiters: [";", "§"],
    csvQuote: '"',
    propertiesLang: 'es_ES', // IMPORTANT --> this must also be the value column name in the .csv
    folderToWriteFilesIn: path.dirname(require.main.filename) + '/propertiesFilesGenerated' // const test = 'C:/conair.sfcc/cartridges/app_babyliss_fr/cartridge/templates/resources/account_nl_NL.properties';
}

/**
 * Transforme the .csv to a json and callback the next function
 */
function startWithCsvToJson(){
    csv({
        delimiter: opts.csvPossibleDelimiters,
        quote: opts.csvQuote
    })
    .fromFile(opts.filePath)
    .then((jsonObj)=>{
        jsonToPropFiles(jsonObj);
    })
}

/**
 * Transforme the json from the csv to an object like this :
 * {
 *  fileName1: { key1: "text1", key2: "text2"},
 *  fileName2: { key1: "text1", key2: "text2"},
 * }
 * 
 * And then callback the next function
 */
function jsonToPropFiles(csvKeyVals){
    let propFiles = {};
        csvKeyVals.forEach(el => {
        let tmp = el.Key.split('/');
        let propFileName = tmp[3];
        let propKey = tmp[4];
        let val = el[opts.propertiesLang];
        if (!propFiles[propFileName]) {
            propFiles[propFileName] = {};
            propFiles[propFileName][propKey] = val;
        }else{
            propFiles[propFileName][propKey] = val;
        }
    });
    makePropertiesFiles(propFiles)
}

/**
 * Transforme the objects to strings that will be placed in .properties files when calling the next function.
 * The string can be :
 * key1=value1
 * key2=value2
 */
function makePropertiesFiles(propFiles){
    Object.keys(propFiles).forEach(file =>{
        let fileObjToStr = propFiles[file];
        let str = parser.stringify(fileObjToStr);
        strToFile(str, file);
    });
}

/**
 * Transforme a string to a file with the string in it.
 */
function strToFile(str, fileName) {
    str = '# Made with the Node.js script 18904-csvRessourcesImport <gbrun@altima-agency.com>\n' + str;
    fileName = fileName + '_' + opts.propertiesLang + '.properties';
    fs.writeFile(opts.folderToWriteFilesIn + '/' + fileName, str, err => {
        if(err) {
            return console.log(err);
        }
        console.log(`File ${fileName} made in ${opts.folderToWriteFilesIn}`);
    }); 
}

/**
 * Let's start
 */
startWithCsvToJson();