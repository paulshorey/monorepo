import axios from "axios";
const oxParams = {
    url: (keyword) => "https://od-api.oxforddictionaries.com/api/v2/entries/en/" + keyword + "?strictMatch=false",
    urlHeaders: {
        app_id: "fd15f247",
        app_key: "9ccde0416081d880b13f64c03cac599b"
    }
};
let DEBUG1 = false;
export const dictionary_definition = function (input_key) {
    if (DEBUG1)
        global.cconsole.info("define:", input_key);
    return new Promise(async (resolve, reject) => {
        let ox;
        let entries = [];
        try {
            ox = await axios.get(oxParams.url(input_key), { headers: oxParams.urlHeaders || {} });
            let oxford = ox.data.results;
            // 1st
            try {
                entries.push(oxford[0].lexicalEntries[0].entries[0].senses[0].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[0].lexicalEntries[0].entries[0].senses[1].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[0].lexicalEntries[0].entries[1].senses[0].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[0].lexicalEntries[1].entries[0].senses[0].definitions[0]);
            }
            catch (e) { }
            // 2nd
            try {
                entries.push(oxford[1].lexicalEntries[0].entries[0].senses[0].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[1].lexicalEntries[0].entries[0].senses[1].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[1].lexicalEntries[0].entries[1].senses[0].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[1].lexicalEntries[1].entries[0].senses[0].definitions[0]);
            }
            catch (e) { }
            // 3rd
            try {
                entries.push(oxford[2].lexicalEntries[0].entries[0].senses[0].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[2].lexicalEntries[0].entries[0].senses[1].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[2].lexicalEntries[0].entries[1].senses[0].definitions[0]);
            }
            catch (e) { }
            try {
                entries.push(oxford[2].lexicalEntries[1].entries[0].senses[0].definitions[0]);
            }
            catch (e) { }
        }
        catch (e) {
            if (DEBUG1)
                global.cconsole.log("no definition found", input_key, e.message);
            reject("no definition found");
        }
        resolve(entries.slice(0, 3));
    });
};
