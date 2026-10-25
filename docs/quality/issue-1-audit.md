# Issue #1 initial audit

Source audit before gameplay repairs (baseline master):

- FOB-03/04/05 FAIL: assignDefender immediately writes slot IDs and snaps x by up to 33 units; occupied counts assignments rather than arrivals.
- RO-05/FOB-07 FAIL: updateRocketeer walks even with guardBase set when no enemy is nearby.
- FOB-01/09 UNVERIFIED: renderer draws opaque roof and sandbags before soldiers; visual inspection required.
- CB-01 UNVERIFIED: collision uses endpoint proximity and can miss swept hits with larger steps.
- QA-01 FAIL: no deterministic browser harness or simulation stepping API.
- All remaining requirements UNVERIFIED pending browser assertions and independent review.

Playwright setup uses a fixed mobile viewport, fixed 1/60 second steps, no automatic animation in test mode, and explicit combat isolation. Production Flight School and Unity files remain untouched.
