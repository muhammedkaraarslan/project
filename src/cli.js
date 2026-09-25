#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { validateCase, renderCase, compareCases } from './index.js';

const usage = 'Usage: vigil validate <case.json> [...] | render <case.json> | compare <before.json> <after.json>';

async function load(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function main(args) {
  const [command, ...files] = args;
  if (command === 'validate' && files.length > 0) {
    let failed = false;
    for (const file of files) {
      try {
        const result = validateCase(await load(file));
        if (result.valid) process.stdout.write(`OK ${file}\n`);
        else {
          failed = true;
          for (const error of result.errors) process.stderr.write(`${file}: ${error.path}: ${error.message}\n`);
        }
      } catch (error) {
        failed = true;
        process.stderr.write(`${file}: ${error.message}\n`);
      }
    }
    return failed ? 1 : 0;
  }
  if (command === 'render' && files.length === 1) {
    process.stdout.write(renderCase(await load(files[0])));
    return 0;
  }
  if (command === 'compare' && files.length === 2) {
    process.stdout.write(`${JSON.stringify(compareCases(await load(files[0]), await load(files[1])), null, 2)}\n`);
    return 0;
  }
  process.stderr.write(`${usage}\n`);
  return 2;
}

main(process.argv.slice(2)).then((code) => { process.exitCode = code; }).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
