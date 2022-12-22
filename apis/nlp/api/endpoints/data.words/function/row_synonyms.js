export default function (row = {}) {
    if (row.dict) {
        row.synonyms = [];
        let pos_nums = {};
        let pos_maxs = {};
        if (row.pos1)
            pos_maxs[row.pos1] = row["x" + row.pos1] || 30;
        if (row.pos2)
            pos_maxs[row.pos2] = row["x" + row.pos2] || 30;
        if (row.pos3)
            pos_maxs[row.pos3] = row["x" + row.pos3] || 30;
        if (row.pos4)
            pos_maxs[row.pos4] = row["x" + row.pos4] || 30;
        if (row.pos5)
            pos_maxs[row.pos5] = row["x" + row.pos5] || 30;
        for (let key in row.dict) {
            // each synonym
            let info = row.dict[key];
            if (!info[12])
                continue; // must be synonym, not derivation
            let str = typeof info[3] === "string" && info[3] ? info[3] : key;
            let pos = info[9];
            // add ?
            if (!pos_maxs[pos])
                continue;
            if (pos_nums[pos] && pos_nums[pos] >= pos_maxs[pos])
                continue;
            // add
            row.synonyms.push([str, info[0], info[1], info[2], pos]);
            if (!pos_nums[pos])
                pos_nums[pos] = 0;
            pos_nums[pos]++;
        }
    }
}
