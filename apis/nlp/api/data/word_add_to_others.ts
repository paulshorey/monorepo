export default [
  {
    path: "/v1/word_add_to_others",
    method: "put",
    auth: ["captcha"],
    response: async function ({ req, res }) {
      throw new Error("API not available")
      // const results = await data_word_add_to_others({
      //   word: req.body.word,
      //   pos: req.body.pos,
      //   addtoothers: req.body.addtoothers
      // })
      // if (results) {
      //   return results
      // } else {
      //   res.status(400)
      //   return { error: `failed word row.key="${req.body.key}"` }
      // }
    }
  }
]
