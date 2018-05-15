import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";


export default {
    input: "./index.js",
    output: [
        {
            file: "./cjs/index.js",
            format: "cjs"
        },{
            file: "./esm/index.js",
            format: "es"
        }
    ],
    watch: {
        include: ["./index.js"]
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
