import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['./dist/index.js'],
    format: 'esm',
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: 'wesly.js',
});
