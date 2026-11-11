# Third-party notices

This package's own code is **MIT** (see `LICENSE`), and that is what the `license` field says. This
file is not a second license on it: it is the attribution that the third-party components below
require, and the record of where each one came from.

The runtime in `assets/` and the JavaScript bundled into `dist/clang-wasm.global.js` are not ours.
Those seven asset files are third-party builds, and this file is the notice they require.

Every asset here is **permissive**. None is copyleft, and nothing in this package places a copyleft
obligation on the programs you compile with it. That was a deliberate constraint on what the package
ships - see [what is deliberately absent](#what-is-deliberately-absent).

Each file's SHA-256 is pinned in `src/asset-receipts.js`, and the same values are in the parent
repository's `toolchain.lock.json` next to a note on where each one came from.

| Asset | What it is | License |
| --- | --- | --- |
| `bin/clang.wasm.gz` | Clang 22.1.8 compiled to WebAssembly | Apache-2.0 WITH LLVM-exception |
| `bin/lld.wasm.gz` | `wasm-ld` from the same LLVM build | Apache-2.0 WITH LLVM-exception |
| `bin/memfs.wasm.gz` | The in-memory filesystem Clang's sysroot is mounted into - **rebuilt from source and modified**, see below | Apache-2.0 WITH LLVM-exception, plus stb (Unlicense / MIT) for `stb_sprintf.h` |
| `bin/sysroot.tar.gz` | libc++ headers and wasi-libc, mounted as the compiler's sysroot | Apache-2.0 WITH LLVM-exception, Apache-2.0, MIT, BSD-2-Clause, BSD-3-Clause, CC0-1.0 |
| `objective-c/libobjc.a` | GNUstep libobjc2, the Objective-C runtime programs link against | MIT |
| `objective-c/headers.json` | The libobjc2 headers, mounted into the memfs | MIT |
| `runtime-manifest.v1.json` | Metadata describing the toolchain, produced by the wasm-llvm project alongside it | no separate license statement in the file |

## Provenance

- **LLVM.** Clang and LLD are from LLVM 22.1.8, revision `ca7933e47d3a3451d81e72ac174dcb5aa28b59d1`,
  targeting `wasm32-wasi` (WASI preview 1). Apache-2.0 WITH LLVM-exception; the exception is what
  keeps this package's permissive licensing simple.
- **The sysroot.** libc++ headers are from `llvm-project` tag `llvmorg-22.1.0`, restored where the
  producer had pruned them. The C headers are wasi-libc's, from WASI SDK 33.0, restored in full for
  the same reason: a prune leaves headers that include files it dropped, which is how `<unistd.h>`
  came to be shipped without `<__header_unistd.h>` and `<bits/posix.h>`. wasi-libc is explicitly
  multi-licensed under Apache-2.0 WITH LLVM-exception, Apache-2.0 and MIT, and the parts of it derived
  from other works keep theirs: dlmalloc is CC0, emmalloc and musl-derived files are MIT, cloudlibc is
  BSD-2-Clause, and musl-fts is BSD-3-Clause.
- **libobjc2.** GNUstep's Objective-C runtime, MIT. It is the whole Objective-C runtime: it is a
  runtime and not a class library, which is why this package has no `NSObject`.
- **memfs.** See the modification notice below.

## memfs modification notice (Apache-2.0 section 4(b))

`bin/memfs.wasm.gz` is **not** the binary the producer published. It is rebuilt here from
`binji/llvm-project`'s `binji/memfs.c` and `stb_sprintf.h`, with three kinds of change:

1. `MAX_NODES` raised from 1024 to 4096. This is the entire point of the rebuild: the fixed node
   table is why the producer's sysroot ships with libc++ pruned.
2. Mechanical renames for a modern WASI toolchain - `<wasi/core.h>` to `<wasi/api.h>`, the `__WASI_E*`
   errno constants gaining an `ERRNO_` infix, the flag constants being pluralised, and the
   `__wasi_filestat_t` / `__wasi_prestat_t` field renames.
3. `abort()` replaced with `__builtin_trap()`, because libc's `abort()` reaches a
   `wasi_snapshot_preview1` import the runtime does not satisfy.

**This file was changed, and the date of the change is not recorded in it.** Apache-2.0 section 4(b)
asks for a prominent notice saying so, and this is that notice; the build script that applies the
changes is the parent repository's `build-memfs.mjs`. `memfs.c` carries no per-file license header of
its own - the containing repositories are Apache-2.0 (`binji/wasm-clang`) and Apache-2.0 WITH
LLVM-exception (`binji/llvm-project`) - so if you intend to rely on this notice, confirm the terms
with that author first.

## What this package depends on

`@wasm-idle/llvm-core` drives the compiler, and it ships no binaries of its own - which is why this
package has to carry the assets above.

How it is shipped differs by entry point, and one of them changes the obligations:

- **`src/`** - the ESM and Node builds - **imports** it. Nothing is bundled, so a consumer's own
  dependency resolution applies and this package redistributes none of it.
- **`dist/clang-wasm.global.js`** - the IIFE build, for classic workers and pages that cannot use
  modules - **bundles it**, together with its own runtime dependencies. That build does redistribute
  their code, so it carries their notices in its banner, and if you pass that file on you should pass
  this file with it.

Bundled into `dist/clang-wasm.global.js`:

| Package | License |
| --- | --- |
| `@wasm-idle/llvm-core` | MIT AND Apache-2.0 WITH LLVM-exception |
| `@bjorn3/browser_wasi_shim` | MIT OR Apache-2.0 |
| `fflate` | MIT |

## What is deliberately absent

The producer also publishes a GNUstep Base build - `libgnustep-base.a`, `libgnustep-base.o`,
`foundation-headers.json`, and `libffi.a` - which would give Objective-C a Foundation class library.
**None of it is in this package.** Two reasons, and the first would be enough on its own:

- **It is LGPL-2.1.** GNUstep Base is LGPL-2.1 (see its `COPYING.LIB`). Statically linking it into a
  program is exactly the case the LGPL has opinions about, and shipping it here would put that
  question in front of every user of this package. The permissive-only rule above excludes it.
- **It does not work with this toolchain anyway.** The header inlining the upstream Objective-C
  worker uses to make Foundation available does not survive that header set: thirteen headers import
  `<GNUstepBase/GSBlocks.h>` which nothing mounts, and headers first reached inside an `#if` branch
  are emitted there regardless. The parent repository's README has the full diagnosis.

`libffi.a` is MIT and would be harmless to ship, but it exists only to serve that Foundation path, so
it is left out with the rest.
