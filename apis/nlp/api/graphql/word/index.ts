import graphql from "graphql"
import wordQueries from "./queries"
// import wordMutations from "./mutations"
import { Express } from "express-serve-static-core"
import expressGraphQl from "express-graphql"
const { GraphQLSchema } = graphql

export default function (expressApp: Express) {
  const wordSchema = new GraphQLSchema({
    query: wordQueries
    // mutation: wordMutations
  })

  expressApp.use(
    "/graphql/word",
    expressGraphQl({
      schema: wordSchema,
      graphiql: true
    })
  )
}
