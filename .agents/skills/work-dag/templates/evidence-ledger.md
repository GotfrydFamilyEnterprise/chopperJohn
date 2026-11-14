<!-- OPTIONAL companion to the work-dag skill. Copy into your project (e.g. docs/evidence-ledger.md),
     replace the placeholders, delete this comment. Rows reference DAG node ids (T1, B2, ...). -->
# <Project> evidence ledger

Facts recorded as they are established, each with a source. Status values:

- **VERIFIED**: read directly in a primary source (code, document, ticket, measurement). Cite it.
- **INFERRED**: reasoned from evidence; state the evidence and what would confirm it.
- **NOT MEASURED**: could not be checked; state why.

Rule of thumb: no number, date or claim without a source; if there is none, mark it NOT MEASURED.

## Facts

| ID | Claim | Status | Source | DAG step | Date |
|---|---|---|---|---|---|
| F-001 | <one verifiable statement> | VERIFIED | <file path + line, URL, query, commit, or document + section> | T1 | YYYY-MM-DD |
| F-002 | <statement reasoned from evidence> | INFERRED | <evidence it rests on; what would confirm it> | B1 | YYYY-MM-DD |
| F-003 | <statement that could not be checked> | NOT MEASURED | <why: no access, no data, out of time> | T2 | YYYY-MM-DD |

## Review queue

Findings outside the current scope that need a human decision before anyone acts on them. Do not act on these silently.

| ID | Finding | Why it needs a decision | Source | Raised at (DAG step) | Decision | Decided by / date |
|---|---|---|---|---|---|---|
| R-001 | <what was found> | <risk, ownership, or scope question> | <source> | T1 | open | |

## Open questions

| ID | Question | Blocks (DAG step) | Owner | Status | Answer / source |
|---|---|---|---|---|---|
| Q-001 | <question> | T2 | <role or name> | open | |
