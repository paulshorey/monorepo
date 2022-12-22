function promiseCombiner(...promises) {
  if (promises.length === 0) {
    throw new Error("At least one argument is required")
  }
  return new Promise(async function (resolve, reject) {
    let responses: any = await Promise.all(promises)
    for (let response of responses) {
      console.log(response)
    }
  })
}

module.exports = { promiseCombiner }
