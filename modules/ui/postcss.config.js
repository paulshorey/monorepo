module.exports = {
  plugins: {
    "postcss-plugin": process.env.NODE_ENV === "production" ? {} : false,
  },
};
