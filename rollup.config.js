import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import packageJson from "./package.json";
import axios from "axios";

const reactDomVersion = /[0-9.]+$/.exec(
  packageJson.devDependencies["react-dom"]
)[0];

function createConfig(
  format,
  nodeEnv,
  dependencyReactVersion,
  project = "react-dom"
) {
  const dir = format === "module" ? "esm" : format;
  // This is used to determine the url of react that is embedded in the ".resolved" esm bundle
  const reactFileExtra =
    nodeEnv === "development" ? "development" : "production.min";
  // This is used to determine the path of the file that is our input
  let inputFileExtra = reactFileExtra;
  if (project === "react-dom-server") {
    inputFileExtra = `browser.${inputFileExtra}`;
  }
  const resolved = dependencyReactVersion ? "resolved." : "";

  return {
    input:
      format === "system"
        ? `src/${project}.${inputFileExtra}.js`
        : require.resolve(`react-dom/cjs/${project}.${inputFileExtra}.js`),
    output: {
      file: `${dir}/${project}.${resolved}${inputFileExtra}.js`,
      format,
      banner: `/* ${project}@${reactDomVersion} ${nodeEnv} version */`,
      paths: {
        react: dependencyReactVersion
          ? `//cdn.jsdelivr.net/npm/@esm-bundle/react@${dependencyReactVersion}/esm/react.${reactFileExtra}.js`
          : "react",
      },
    },
    plugins: [
      resolve(),
      commonjs(),
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(nodeEnv),
        },
      }),
      nodeEnv === "development"
        ? false
        : terser({
            output: {
              comments(node, comment) {
                return (
                  comment.value.trim().startsWith(`react-dom@`) ||
                  comment.value.trim().startsWith(`react-dom-server@`)
                );
              },
            },
          }),
    ].filter(Boolean),
    external: ["react"],
  };
}

export default async () => {
  const reactVersions = (
    await axios("https://data.jsdelivr.com/v1/package/npm/@esm-bundle/react")
  ).data.versions;
  const dependencyReactVersion = reactVersions.find((v) =>
    v.startsWith(reactDomVersion)
  );

  return [
    createConfig("module", "production", dependencyReactVersion),
    createConfig("module", "development", dependencyReactVersion),
    createConfig("module", "production"),
    createConfig("module", "development"),
    createConfig("system", "production"),
    createConfig("system", "development"),
    // react-dom-server
    createConfig(
      "module",
      "production",
      dependencyReactVersion,
      "react-dom-server"
    ),
    createConfig(
      "module",
      "development",
      dependencyReactVersion,
      "react-dom-server"
    ),
    createConfig("module", "production", null, "react-dom-server"),
    createConfig("module", "development", null, "react-dom-server"),
    createConfig("system", "production", null, "react-dom-server"),
    createConfig("system", "development", null, "react-dom-server"),
  ];
};
