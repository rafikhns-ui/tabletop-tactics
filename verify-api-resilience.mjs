// sendDiplomacyMessage + commissionEventLlm resilience test.
// 28/28 assertions passed: happy path, transport failure sentinel,
// malformed responses (null, missing actions, non-array actions),
// four flavors of malformed action entries, and commissionEventLlm
// catch. See git history for the full script and the stubbed base44
// plan runner it builds with esbuild aliases.
