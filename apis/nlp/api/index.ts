import initGlobal from "@ps/nlp/lib/global" // also used by unit tests
import startServer from "./server"
import initExpressApp from "@ps/nlp/api/express"

import apiV1 from "./v1"
import apiData from "./data"
// import apiGraphqlWord from "./graphql/word"
import apiRoot from "./root"

initGlobal()
const expressApp = initExpressApp()

apiV1(expressApp)
apiData(expressApp)
// apiGraphqlWord(expressApp)
apiRoot(expressApp)

startServer(expressApp)
