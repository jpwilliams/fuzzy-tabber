module.exports = {
  content: ["./src/**/*.tsx"],
  safelist: [
    {
      pattern: /bg-group-.*/,
    },
  ],
  theme: {
    extend: {
      colors: {
        "group-grey": "#b8b8b8",
        "group-blue": "#75c3ff",
        "group-red": "#ff6c6c",
        "group-yellow": "#ffbb00",
        "group-green": "#7fda91",
        "group-pink": "#ff83cd",
        "group-purple": "#b0a4ff",
        "group-cyan": "#00bcc6",
      },
    },
  },
  plugins: [],
};
