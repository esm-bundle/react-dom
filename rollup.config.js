import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import packageJson from "./package.json";
import axios from "axios";
import { babel } from "@rollup/plugin-babel";
import path from "path";

const reactDomVersion = /[0-9.]+$/.exec(
  packageJson.devDependencies["react-dom"]
)[0];

function createReactDomServerConfig({
  format,
  nodeEnv,
  dependencyReactVersion,
  es5 = false,
}) {
  const { dir, reactFileExtra, resolved } = getDirFileExtraAndResolved(
    format,
    nodeEnv,
    dependencyReactVersion
  );
  const es5FileExtra = `${es5 ? "-es5" : ""}`;
  const inputFileExtra = `browser.${reactFileExtra}`;
  const plugins = getCommonPlugins(nodeEnv);
  if (es5) {
    plugins.push(
      babel({
        configFile: path.resolve(__dirname, "es5-babel-config.json"),
      })
    );
  }

  return {
    input: `src/react-dom-server.${inputFileExtra}.js`,
    output: {
      format,
      file: `${dir}/react-dom-server.${resolved}${inputFileExtra}${es5FileExtra}.js`,
      sourcemap: true,
      banner: `/* react-dom-server@${reactDomVersion} ${nodeEnv} ${es5FileExtra} version */`,
      paths: {
        react: dependencyReactVersion
          ? `//cdn.jsdelivr.net/npm/@esm-bundle/react@${dependencyReactVersion}/esm/react.${reactFileExtra}.js`
          : "react",
      },
    },
    plugins,
    external: ["react"],
  };
}

function createReactDomConfig(format, nodeEnv, dependencyReactVersion) {
  const { dir, reactFileExtra, resolved } = getDirFileExtraAndResolved(
    format,
    nodeEnv,
    dependencyReactVersion
  );
  const inputFileExtra = reactFileExtra;
  const plugins = getCommonPlugins(nodeEnv);

  return {
    input:
      format === "system"
        ? `src/react-dom.${inputFileExtra}.js`
        : require.resolve(`react-dom/cjs/react-dom.${inputFileExtra}.js`),
    output: {
      file: `${dir}/react-dom.${resolved}${inputFileExtra}.js`,
      format,
      banner: `/* react-dom@${reactDomVersion} ${nodeEnv} version */`,
      paths: {
        react: dependencyReactVersion
          ? `//cdn.jsdelivr.net/npm/@esm-bundle/react@${dependencyReactVersion}/esm/react.${reactFileExtra}.js`
          : "react",
      },
    },
    plugins,
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
    createReactDomConfig("module", "production", dependencyReactVersion),
    createReactDomConfig("module", "development", dependencyReactVersion),
    createReactDomConfig("module", "production"),
    createReactDomConfig("module", "development"),
    createReactDomConfig("system", "production"),
    createReactDomConfig("system", "development"),
    // react-dom-server
    createReactDomServerConfig({
      format: "module",
      nodeEnv: "production",
      dependencyReactVersion,
    }),
    createReactDomServerConfig({
      format: "module",
      nodeEnv: "development",
      dependencyReactVersion,
    }),
    createReactDomServerConfig({ format: "module", nodeEnv: "production" }),
    createReactDomServerConfig({ format: "module", nodeEnv: "development" }),
    createReactDomServerConfig({ format: "system", nodeEnv: "production" }),
    createReactDomServerConfig({ format: "system", nodeEnv: "development" }),
    // react-dom-server-es5 build
    createReactDomServerConfig({
      format: "system",
      nodeEnv: "production",
      es5: true,
    }),
    createReactDomServerConfig({
      format: "system",
      nodeEnv: "development",
      es5: true,
    }),
  ];
};

function getDirFileExtraAndResolved(format, nodeEnv, dependencyReactVersion) {
  const dir = format === "module" ? "esm" : format;
  // This is used to determine the url of react that is embedded in the ".resolved" esm bundle
  const reactFileExtra =
    nodeEnv === "development" ? "development" : "production.min";
  // This is used to determine the path of the file that is our input
  const resolved = dependencyReactVersion ? "resolved." : "";
  return {
    dir,
    reactFileExtra,
    resolved,
  };
}

function getCommonPlugins(nodeEnv) {
  return [
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
  ].filter(Boolean);
}
