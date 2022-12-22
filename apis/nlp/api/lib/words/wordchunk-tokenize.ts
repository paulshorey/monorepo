import pos_expand from "@ps/nlp/data/words/dict/pos_expand"
export default async function (output, options: any = {}) {
  if (!output || !output.string || !output.chunks_keys || !output.chunks_rows) return
  output.chunks_info = {}

  for (let key in output.chunks_rows) {
    let row = output.chunks_rows[key]
    if (row) {
      let info: any = {
        root: row.root || undefined,
        singular: row.singular || undefined,
        plural: row.plural || undefined,
        abbreviations: row.abbreviations || undefined,
        acronyms: row.acronyms || undefined,
        name: row.name || undefined,
        sentiment: row.sentiment,
        pos1: pos_expand[row.pos1],
        pos2: row.pos2 ? pos_expand[row.pos2] : undefined,
        pos3: row.pos3 ? pos_expand[row.pos3] : undefined
      }
      if (row.pos1 && row.poss[row.pos1]) info[pos_expand[row.pos1]] = row.poss[row.pos1]
      if (row.pos2 && row.poss[row.pos2]) info[pos_expand[row.pos2]] = row.poss[row.pos2]
      if (row.pos3 && row.poss[row.pos3]) info[pos_expand[row.pos3]] = row.poss[row.pos3]
      output.chunks_info[row.str] = info
    }
  }

  return { ...output, keys: undefined, chunks_keys: undefined, chunks_rows: undefined }
}
