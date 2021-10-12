import * as fs from 'fs';

import { CoreSchema } from '@apollo/core-schema';
import { Source } from 'graphql';

try {
  const sdl = fs.readFileSync('./supergraph.graphql').toString();
  const core = CoreSchema.fromSource(new Source(sdl, 'supergraphSdl'));
  core.check();
} catch (e) {
  console.error(e);
  throw e;
}

