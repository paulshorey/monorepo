export default [
  {
    method: "get",
    path: "/",
    response: ({ req }) => {
      global.cconsole.log("req", req)
      return {
        test: "4",
        documentation: "https://documenter.getpostman.com/view/23360867/2s8YzXtewC",
        greetings: [
          "hi",
          "howdy",
          "hey",
          "shalom",
          "salam",
          "aloha",
          "hola",
          "bonjour",
          "ciao",
          "wassup",
          "hello",
          "salutation",
          "welcome",
          "hullo",
          "hallo",
          "hiya",
          "hug",
          "kiss",
          "welcome",
          "hello there"
        ]
      }
    }
  }
]
