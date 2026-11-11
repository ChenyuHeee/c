# Contributing to C Lab

## Development workflow

1. Create a focused branch from `main`.
2. Run `npm ci` and `npm run dev`.
3. Keep changes scoped and match the existing React + TypeScript structure.
4. Run `npm run typecheck` and `npm run build` before opening a pull request.
5. For UI changes, verify both desktop and mobile layouts and include screenshots.

## Project conventions

- Keep the application backend-free and deployable as static files.
- Do not introduce simulated compiler output. If compilation is unavailable, explain the failure honestly.
- Keep source, stdin, and settings local unless the user explicitly runs or shares them.
- Put reusable compiler, storage, and sharing logic in `src/lib/`.
- Keep example and exercise data in `src/data/`; use real C and test every reference solution against its public cases.
- Keep compilation and execution inside the browser Worker. Do not send source to a remote compiler service.
- Preserve compatibility with the WASI runtime and avoid relying on C++ extensions or native operating-system APIs.
- Update documentation whenever user-facing behavior, privacy, or deployment changes.

## Pull requests

Describe the user-visible change, the verification performed, and any remaining limitations. Include reproduction steps for bug fixes. Do not commit `node_modules/`, `dist/`, local logs, or generated screenshots unless they are intentionally maintained assets.
