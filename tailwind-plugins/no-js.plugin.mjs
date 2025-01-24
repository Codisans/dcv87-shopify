import plugin from "tailwindcss/plugin";

export default {
    NoJs: plugin(function ({ addVariant, e }) {
        addVariant("no-js", ({ container, separator }) => {
            container.walkRules((rule) => {
                rule.selector = rule.selector
                    .split(", ")
                    .map((item) => {
                        const lastIndex = item.lastIndexOf(" ");
                        return `.no-js ${item.substring(0, lastIndex)}${
                            lastIndex > -1 ? " " : ""
                        }.${e(`no-js${separator}`)}${item.substring(
                            lastIndex + 2
                        )}`;
                    })
                    .join(", ");
                rule.walkDecls((decl) => {
                    decl["no-js"] = true;
                });
            });
        });
    }),
};
