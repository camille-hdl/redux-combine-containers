import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";


export default {
    input: "./esm/index.js",
    output: [
        {
            file: "./cjs/index.js",
            format: "cjs"
        }
    ],
    watch: {
        include: ["./esm/index.js"]
    },
    plugins: [
        replace({
            "process.env.NODE_ENV": JSON.stringify("production")
        }),
        babel({
            exclude: "node_modules/**",
            runtimeHelpers: true
        })
    ]
};
