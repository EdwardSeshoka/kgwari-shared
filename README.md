# kgwari-shared

Shared internal TypeScript packages for Morara.

## What belongs here

**Straightforward, mechanical things.** A package earns a place in shared only if
it is pure: no network, no long-running work, no ambient state. Everything here
should give the same answer on a plane as it does in production, which is what
makes it safe for the backend, the frontend and a generator to all depend on the
same copy.

Anything that adapts to an outside system — an HTTP provider, a platform SDK, a
third-party library with its own release cadence — belongs to whichever app talks
to it, not here.

## Packages

- `@edwardseshoka/contracts` — the wire shape, plus the pure rules derived from
  it. Feature-foldered with per-domain subpaths (`/catalog`, `/search`, …) and
  boundaries enforced by `ContractsTests/Boundaries.test.js`.
- `@edwardseshoka/samples` — seed data, with matching per-domain subpaths.
  Generated; see `packages/samples/generator`.
- `@edwardseshoka/foundation` — common protocols and abstractions (`Mapper`,
  `Result`, validation). **Deliberately dependency-free.**

Three packages, all pure, none with a third-party dependency.

### Removed on 2026-07-31

- `@edwardseshoka/google-places-adapter` — a networked provider adapter,
  published for a backend that never adopted it and imported by nothing.
- `@edwardseshoka/places` — a capability over a networked places API.
- `@edwardseshoka/phone-number-validation` — pure, but it pulled
  `libphonenumber-js`, and a package here should not hand its consumers a
  third-party dependency they did not ask for.

The last two are consumed by **kgwari-frontend-app** and by nothing else, so
they belong to it. Their published versions still resolve, so nothing breaks
today — but they are unmaintained here and should be absorbed into the frontend
rather than left to rot on the registry.

## Versioning model

- Each package under `packages/*` remains a separate package with its own `package.json`.
- Any internal dependency between workspace packages should use `workspace:*`.
- Packages are versioned independently with Changesets.
- For every PR that changes a published package, run `npx changeset` and choose the correct bump type for each affected package.
- Merging to `main` updates or creates a `Version Packages` PR. Merging that PR publishes the updated package versions to GitHub Packages.
- Packages that did not change do not need a version bump.

### Choosing patch, minor, major

- `patch` = bug fixes and non-breaking internal changes.
- `minor` = additive backward-compatible changes.
- `major` = breaking changes for consumers.

## Internal publishing

- Packages publish to GitHub Packages (`https://npm.pkg.github.com`) under the `@edwardseshoka/*` scope.
- GitHub Packages is used instead of public npmjs so shared packages stay internal and access is controlled via GitHub permissions.
- CI publishes only from `main` using Changesets; pull request workflows run validation only.
- The release workflow uses `CHANGESETS_TOKEN` when present, otherwise it falls back to the repository `GITHUB_TOKEN`.
- If using `GITHUB_TOKEN`, enable GitHub's repository setting that allows GitHub Actions to create pull requests.
- The release workflow builds all workspaces before publishing, and each published package runs `prepack` so the published tarball contains compiled `dist` output.
- Consumers should configure npm scope routing:

```ini
registry=https://registry.npmjs.org/
@edwardseshoka:registry=https://npm.pkg.github.com
```

## Fixture organization

Fixtures are organized by API endpoint/use-case (for example `list-wines.json`, `featured-events.json`) rather than by entity tables or frontend view state. This keeps seed data response-like, domain-oriented, and reusable across backend seeding and frontend local doubles.

Kgwari's canonical dev/deploy seed data lives in the `samples` package, split by
feature:

- `packages/samples/src/features/catalog/wines.json`
- `packages/samples/src/features/search/browse-groups.json`
- `packages/samples/src/features/discover/curation.json`

The corpus is generated — see `packages/samples/generator/README.md`. Consumer
repos read these through `@edwardseshoka/samples` so backend deploy seeding and
frontend local doubles stay aligned from one source of truth.

## Getting started

```bash
npm install
npm run build
npm run typecheck
```
