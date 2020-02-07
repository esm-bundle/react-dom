import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import packageJson from "./package.json";
import axios from "axios";

const reactDomVersion = /[0-9.]+$/.exec(
  packageJson.devDependencies["react-dom"]
)[0];

function createConfig(format, nodeEnv, dependencyReactVersion) {
  const dir = format === "module" ? "esm" : format;
  const fileExtra =
    nodeEnv === "development" ? "development" : "production.min";
  const resolved = dependencyReactVersion ? "resolved." : "";

  return {
    input:
      format === "system"
        ? `src/react-dom.${fileExtra}.js`
        : require.resolve(`react-dom/cjs/react-dom.${fileExtra}.js`),
    output: {
      file: `${dir}/react-dom.${resolved}${fileExtra}.js`,
      format,
      banner: `/* react-dom@${reactDomVersion} ${nodeEnv} version */`,
      paths: {
        react: dependencyReactVersion
          ? `//cdn.jsdelivr.net/npm/@esm-bundle/react@${dependencyReactVersion}/esm/react.${fileExtra}.js`
          : "react"
      }
    },
    plugins: [
      resolve(),
      commonjs(),
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(nodeEnv)
        }
      }),
      nodeEnv === "development"
        ? false
        : terser({
            output: {
              comments(node, comment) {
                return comment.value.trim().startsWith("react-dom@");
              }
            }
          })
    ].filter(Boolean),
    external: ["react"]
  };
}

export default async () => {
  const reactVersions = (
    await axios("https://data.jsdelivr.com/v1/package/npm/@esm-bundle/react")
  ).data.versions;
  const dependencyReactVersion = reactVersions.find(v =>
    v.startsWith(reactDomVersion)
  );

  return [
    createConfig("module", "production", dependencyReactVersion),
    createConfig("module", "development", dependencyReactVersion),
    createConfig("module", "production"),
    createConfig("module", "development"),
    createConfig("system", "production"),
    createConfig("system", "development")
  ];
};
