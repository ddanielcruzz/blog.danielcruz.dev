/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        ["always-dark"]: {
          css: {
            "--tw-prose-body": theme("colors.zinc[300]"),
            "--tw-prose-headings": theme("colors.white"),
            "--tw-prose-lead": theme("colors.zinc[400]"),
            "--tw-prose-links": theme("colors.white"),
            "--tw-prose-bold": theme("colors.white"),
            "--tw-prose-counters": theme("colors.zinc[400]"),
            "--tw-prose-bullets": theme("colors.zinc[600]"),
            "--tw-prose-hr": theme("colors.zinc[700]"),
            "--tw-prose-quotes": theme("colors.zinc[100]"),
            "--tw-prose-quote-borders": theme("colors.zinc[700]"),
            "--tw-prose-captions": theme("colors.zinc[400]"),
            "--tw-prose-code": theme("colors.white"),
            "--tw-prose-pre-code": theme("colors.zinc[300]"),
            "--tw-prose-pre-bg": "rgb(0 0 0 / 50%)",
            "--tw-prose-th-borders": theme("colors.zinc[600]"),
            "--tw-prose-td-borders": theme("colors.zinc[700]"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
