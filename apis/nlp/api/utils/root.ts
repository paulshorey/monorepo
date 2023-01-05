export default [
  {
    method: "get",
    path: "/",
    response: ({ req }) => {
      return {
        test: "4",
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
