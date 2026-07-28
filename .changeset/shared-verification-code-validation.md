---
"@edwardseshoka/foundation": minor
---

Add a `Validator` contract, and own the verification-code rule under it.

`Validator` joins `Mapper` and `UseCase` as a foundation contract: `validate`
returns a `Result` rather than a boolean, so a rejection carries *why*. Failures
are returned, never thrown, and a validator reports every issue it found rather
than stopping at the first — one problem at a time makes a caller fix, resubmit,
and be told about the next. Each issue has a stable machine-readable `code`
(switchable, unaffected by copy changes), a developer-facing `message`, and an
optional `path` for values inside composites. Valid values come back
*normalized*, so callers use what the validator returned rather than what they
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
