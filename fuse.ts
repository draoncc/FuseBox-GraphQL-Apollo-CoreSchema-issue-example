import { fusebox, sparky, pluginReplace } from 'fuse-box';
import { pluginTypeChecker } from 'fuse-box-typechecker';

class Context {
  fuse = {
    runDev(runProps?) {
      return fusebox({
        entry: 'src/index.ts',
        target: 'server',
        plugins: [pluginTypeChecker({ tsConfig: './tsconfig.json' })],
      }).runDev(runProps);
    },

    runProd(runProps?) {
      return fusebox({
        entry: 'src/index.ts',
        target: 'server',
        dependencies: {
          serverIgnoreExternals: false,
        },
        plugins: [
          pluginTypeChecker({
            tsConfig: './tsconfig.json',
            throwOnSyntactic: true,
            throwOnSemantic: true,
            throwOnGlobal: true,
            throwOnOptions: true,
          }),
          // Uses module.require to avoid bundled 'crypto' replacement
          pluginReplace('apollo-server-core/dist/utils/createSHA.js', {
            'module.require': 'require',
          }),
        ],
      }).runProd(runProps);
    },
  };
}

const { task, src, exec } = sparky(Context);

task('clean', async () => {
  await src('./dist/*')
    .clean()
    .exec();
});

task('default', async ctx => {
  await exec('clean');

  const { onComplete } = await ctx.fuse.runDev();

  onComplete(target => target.server.start());
});

task('prod', async ctx => {
  await exec('clean');

  ctx.fuse.runProd({
    uglify: false,
    bundles: {
      app: 'app.js',
    },
  });
});
