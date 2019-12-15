import * as dotenv from "dotenv";
import { join } from "path";
import { fusebox, pluginEmotion, sparky } from "../../src";

dotenv.config();

const port = process.env.PORT || process.env.APP_PORT || 8080;
const hostname = process.env.APP_HOST || "localhost";
const openUrl = `http://${hostname}:${port}`;

class Context {
  isProduction;
  runServer;

  getServer() {
    return fusebox({
      cache: {
        FTL: false,
        enabled: false,
        root: ".cache/server"
      },
      defaultCollectionName: "server",
      entry: "server/index.js",
      homeDir: "src/",
      modules: ["./node_modules"],
      output: "dist/server/$name",
      plugins: [
        // pluginEmotion({
        //   target: /src\/(.*?)\.(js|jsx|ts|tsx)$/,
        //   autoInject: true
        // })
      ],
      // sourceMap: !this.isProduction,
      target: "server",
      tsConfig: "src/tsconfig.json",
      useSingleBundle: true
    });
  }

  getClient() {
    return fusebox({
      cache: {
        FTL: false,
        enabled: false,
        root: ".cache/client"
      },
      devServer: {
        hmrServer: { port: 7878 },
        httpServer: false,
        open: {
          target: openUrl // doesn't work
        }
      },
      entry: "client/index.js",
      homeDir: "src/",
      link: { useDefault: true },
      modules: ["./node_modules"],
      output: `dist/client/$name_$hash`,
      plugins: [
        // pluginEmotion({
        //   target: /src\/(.*?)\.(js|jsx|ts|tsx)$/,
        //   autoInject: true
        // })
      ],
      // sourceMap: !this.isProduction,
      target: "browser",
      tsConfig: "src/tsconfig.json",
      webIndex: {
        publicPath: "/assets",
        template: "src/client/index.html"
      }
    });
  }
}

const { rm, task } = sparky<Context>(Context);

const renderManifest = handler => {
  handler.onComplete(({ bundles, ctx: { config } }) => {
    // eslint-disable-next-line no-console
    console.log(
      config.output,
      bundles.map(({ stat: { localPath } }) => localPath)
    );
  });
};

task("default", async ctx => {
  await rm("./dist");
  ctx.runServer = true;
  ctx.isProduction = false;

  const client = ctx.getClient();
  await client.runDev();

  const server = ctx.getServer();
  await server.runDev(handler => {
    handler.onComplete(output => {
      console.log(`We don't always get here.... // bug?`)
      output.server.handleEntry({ nodeArgs: [], scriptArgs: [] });
    });
  });
});

task("dist", async ctx => {
  await rm("./dist");

  ctx.runServer = false;
  ctx.isProduction = true;

  const client = ctx.getClient();
  await client.runProd({ uglify: true, manifest: true });

  const server = ctx.getServer();
  await server.runProd({ uglify: false, manifest: false });
});
