# Continuous Manhattan workspace — 2026-10-06

The user requested that the final lobby/office arrival continue naturally into the Canton practice screens. The workspace now reuses the approved office scene as a persistent decorative background and the lobby scene as a low architectural title frame. Desktop and mobile use the existing delivery assets; no new environment image was generated. These are illustrative environments, not a real Canton office or headquarters claim.

Walnut navigation, bronze inlays, limestone reading surfaces and restrained glass transparency connect the dashboard, six lessons, role documents, reference library, guide and profile dialogs. Role desks use framed surfaces and large A/B/C/D markers. No additional explanatory banners or presentation-style page flow were added. The menu-based shell and scrolling content panel remain.

The only GameApp changes are a theme import and an aria-hidden decorative picture. Learning state, routing, progress keys, profile, modal focus handling and all evidence rules are unchanged. The original local app additionally imports `city-live-interior.css` for its authenticated LiveTerminal. Its returned, denied, pending and error states retain distinct semantic colors; a decorative image cannot establish confidentiality or complete a ledger result. The hosted app continues to show document-based design and REFERENCE_ONLY educational previews, with no ledger server attached.

Verification:

- Hosted build and 32 existing tests passed; original build and 94 relevant tests passed.
- Browser checks covered dashboard, lessons, role switching (A/C/D), reference library, guide dialog and mobile menu. The completed first lesson was reviewed with A/B selections and correct feedback, without awarding a second completion.
- Desktop 1280×720, responsive 390×844 and narrow 320×480 were reviewed. A narrow role-trust panel overflow was found and corrected with `min-width: 0` and button wrapping. Dashboard and role page then had no horizontal content overflow.
- Flat control borders, title/active-tab contrast and disabled action contrast were corrected during review. Reduced motion suppresses the workspace entrance animation and hover transforms through the existing scoped motion policy.
- Captured hosted-preview console had no warning/error entries. The original static terminal preview showed its explicit API-unconnected/502 state; this verifies the offline presentation only. No actual ledger trade was executed for this design change.
- `city-interior-preview.jpg` is a browser screenshot of the hosted dashboard. It shows generic educational progress and fictional parties; it contains no authenticated ledger evidence, keys or personal profile information.

Actual iPhone/Safari and connected local terminal state rendering were not exercised. Existing V1 snapshots and previous releases are preserved. Publication details are recorded in the original local app's `docs/ONLINE_SITE.md` after deployment.
