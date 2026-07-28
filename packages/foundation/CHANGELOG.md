# @edwardseshoka/foundation

## 3.1.0

### Minor Changes

- d575080: Add a `Validator` contract, and own the verification-code rule under it.

  `Validator` joins `Mapper` and `UseCase` as a foundation contract: `validate`
  returns a `Result` rather than a boolean, so a rejection carries _why_. Failures
  are returned, never thrown, and a validator reports every issue it found rather
  than stopping at the first — one problem at a time makes a caller fix, resubmit,
  and be told about the next. Each issue has a stable machine-readable `code`
  (switchable, unaffected by copy changes), a developer-facing `message`, and an
  optional `path` for values inside composites. Valid values come back
  _normalized_, so callers use what the validator returned rather than what they
  passed in. `Validator.accepts` reduces it to a boolean where the reason genuinely
  does not matter.

  Two validators ship on it:

  - `VerificationCodeValidator` — codes `empty`, `notDigits`, `wrongLength`, plus
    `VERIFICATION_CODE_LENGTH` and `VERIFICATION_CODE_PATTERN` for schema
    libraries that want a regex. The length is fixed by AWS Cognito's managed
    `EMAIL_OTP` challenge (`USER_AUTH`), which issues eight digits — not the six
    of the older self-signup confirmation code. Neither end of the wire owns that
    number, and both had guessed it independently and wrongly: the app rendered a
    six-slot field that truncated real codes, and the API validated `/^\d{6}$/`,
    rejecting every real code before Cognito was ever consulted. Email sign-in
    could not succeed in either direction.
  - `EmailValidator` — codes `empty`, `malformed`, normalizing to a trimmed,
    lower-cased address.

  `validateEmail` keeps its signature and behaviour, now expressed through
  `EmailValidator`.

## 3.0.0

### Major Changes

- 444bd2e: Trim `Mapper` to its core: `map` and `flatMap`.

  `Mapper.map(input)` (the interface method) returns a `Result` — failures are returned, not thrown. `Mapper.flatMap(mapper, input)` returns the output directly for non-failable mappers (`Failure = never`, type-gated). Failable callers handle the returned `Result` themselves (`if (!result.success) throw result.error`), keeping the failure decision at the call site.

  Breaking: the `map` (nullable overload), `mapOptional`, `mapOrThrow`, `flatMapOptional`, and `mapOptionalOrThrow` namespace helpers are removed.

## 2.0.0

### Major Changes

- a5a8dd3: `Mapper.map` now returns the output directly for non-failable mappers.

  A `Mapper<Input, Output>` (the default `Failure = never`) returns `Output` from `map`, with no `Result` wrapper and nothing to unwrap; a failable `Mapper<Input, Output, SomeError>` still returns `Result<Output, SomeError>`. `Mapper.mapOrThrow(mapper, input)` continues to return `Output` uniformly for both.

  Breaking: non-failable mapper implementations return their output directly instead of `{ success: true, data }`, and the `map` / `mapOptional` / `flatMap` / `flatMapOptional` / `mapOptionalOrThrow` namespace helpers are removed (call `.map()` directly, or `mapOrThrow`).

## 1.2.1

### Patch Changes

- 6f63c3b: Packages Restructure Change Set

## 1.2.0

### Minor Changes

- 77e85e5: Add dependency-free shared email validation.

## 1.1.0

### Minor Changes

- 7cfa663: Introduce publishing script

## 1.0.0

### Major Changes

- 030694a: Establish the first stable shared package releases.

  This promotes the shared contracts, fixtures, and foundation packages to the
  `1.x` line so app repositories can consume backward-compatible minor and patch
  updates with a semver range like `^1.0.0`, while future breaking changes remain
  manual app upgrades.

## 0.1.0

### Initial release

- Added the initial Morara shared foundation utilities package.
