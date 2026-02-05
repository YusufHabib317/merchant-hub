const localLocales = ["common", "error"];

module.exports = {
  locales: ["en", "ar"],
  defaultLocale: "ar",
  pages: {
    "*": ["common", "error"],
    "/dashboard": ["common", "error"],
    "/dashboard/products": ["common", "error"],
    "/dashboard/chat": ["common", "error"],

    "/dashboard/store": ["common", "error"],
    "/dashboard/qr": ["common", "error"],
    "/dashboard/templates": ["common", "error"],
    "/m/[slug]": ["common", "error"],
  },
  loadLocaleFrom: async (lang, ns) => {
    if (localLocales.includes(ns)) {
      const locale = import(`./locales/${lang}/${ns}.json`).then((v) => v.default);
      return locale;
    }
  },
};
