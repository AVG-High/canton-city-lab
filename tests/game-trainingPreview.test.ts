import test from 'node:test';
import assert from 'node:assert/strict';
import { missions } from '../src/game/curriculum.ts';
import { trainingPreview } from '../src/game/trainingPreview.ts';

test('planned contract recipients follow selection while C and D are flagged as unnecessary original disclosure', () => {
  const planned = trainingPreview('boundary', ['seller', 'buyer']);
  assert.deepEqual(planned.boundary?.recipients.map(item => [item.role, item.delivery]), [['A', 'planned'], ['B', 'planned'], ['C', 'withheld'], ['D', 'withheld']]);
  const broad = trainingPreview('boundary', ['seller', 'buyer', 'auditor', 'outsider']);
  assert.equal(broad.tone, 'warning');
  assert.equal(broad.nodes.find(item => item.id === 'auditor')?.state, 'warning');
  assert.equal(broad.edges.filter(item => item.active).length, 4);
  assert.equal(trainingPreview('boundary', ['seller']).nodes.find(item => item.id === 'buyer')?.state, 'warning');
});

test('the atomic model rolls both movements back on failure and never mutates its input or another preview', () => {
  const selected = ['one-transaction', 'rollback-both'];
  const success = trainingPreview('atomic', selected, { failure: false }).atomic!;
  assert.deepEqual(success.before, { A: { bond: 1000, cash: 0 }, B: { bond: 0, cash: 20000 } });
  assert.deepEqual(success.after, { A: { bond: 900, cash: 10000 }, B: { bond: 100, cash: 10000 } });
  const failed = trainingPreview('atomic', selected, { failure: true }).atomic!;
  assert.deepEqual(failed.after, failed.before);
  assert.ok(failed.legs.every(item => item.state === 'rolled-back'));
  assert.notEqual(failed.after, failed.before);
  failed.after!.A.bond = -1;
  assert.equal(success.before.A.bond, 1000);
  assert.equal(trainingPreview('atomic', selected, { failure: true }).atomic!.after!.A.bond, 1000);
  assert.deepEqual(selected, ['one-transaction', 'rollback-both']);
});

test('failure of the second independent transfer leaves the first transfer intact and all synthetic assets conserved', () => {
  const failed = trainingPreview('atomic', ['separate-transfers'], { failure: true }).atomic!;
  assert.equal(failed.layout, 'independent');
  assert.deepEqual(failed.after, { A: { bond: 900, cash: 0 }, B: { bond: 100, cash: 20000 } });
  assert.deepEqual(failed.legs.map(item => item.state), ['transferred', 'failed']);
  for (const selection of [['one-transaction', 'rollback-both'], ['separate-transfers']]) {
    for (const failure of [false, true]) {
      const preview = trainingPreview('atomic', selection, { failure }).atomic!;
      assert.equal(preview.after!.A.bond + preview.after!.B.bond, 1000);
      assert.equal(preview.after!.A.cash + preview.after!.B.cash, 20000);
      for (const value of [preview.after!.A.bond, preview.after!.A.cash, preview.after!.B.bond, preview.after!.B.cash]) assert.ok(Number.isSafeInteger(value) && value >= 0);
    }
  }
});

test('incomplete or conflicting transfer policies do not invent settlement balances', () => {
  for (const selection of [[], ['one-transaction'], ['rollback-both'], ['canton-only']]) {
    const preview = trainingPreview('atomic', selection, { failure: true });
    assert.equal(preview.atomic!.layout, 'incomplete');
    assert.equal(preview.atomic!.after, null);
    assert.ok(preview.atomic!.legs.every(item => item.state === 'unknown'));
  }
  for (const selection of [['one-transaction', 'separate-transfers'], ['rollback-both', 'separate-transfers']]) {
    assert.equal(trainingPreview('atomic', selection).atomic!.layout, 'conflicting');
    assert.equal(trainingPreview('atomic', selection).atomic!.after, null);
  }
});

test('timeout prevents interpretation even if all four learning controls are selected', () => {
  const controls = ['empty-result', 'valid-auth', 'target-exists', 'query-complete'];
  const complete = trainingPreview('visibility', controls);
  assert.equal(complete.visibility!.interpretable, true);
  assert.equal(complete.visibility!.count, 4);
  const timeout = trainingPreview('visibility', [...controls, 'timeout']);
  assert.equal(timeout.visibility!.count, 4);
  assert.equal(timeout.visibility!.interpretable, false);
  assert.equal(timeout.tone, 'danger');
  assert.match(timeout.status, /성공 근거 아님/);
  for (const missing of controls) assert.equal(trainingPreview('visibility', controls.filter(id => id !== missing)).visibility!.interpretable, false);
  assert.equal(trainingPreview('visibility', ['empty-result']).visibility!.count, 1);
});

test('audit models read and transfer independently and never claims old copies are deleted', () => {
  const readOnly = trainingPreview('audit', ['read-audit', 'no-transfer']).audit!;
  assert.equal(readOnly.canReadAudit, true);
  assert.equal(readOnly.canTransfer, false);
  assert.equal(trainingPreview('audit', ['read-audit']).audit!.canTransfer, null);
  const allowed = trainingPreview('audit', ['read-means-transfer']).audit!;
  assert.equal(allowed.canReadAudit, false);
  assert.equal(allowed.canTransfer, true);
  const conflicting = trainingPreview('audit', ['read-audit', 'no-transfer', 'read-means-transfer', 'erase-copies']).audit!;
  assert.equal(conflicting.transferPolicy, 'conflicting');
  assert.equal(conflicting.canTransfer, null);
  assert.equal(conflicting.copiesDeleted, false);
});

test('UI hiding does not erase the teaching model of a public ledger or establish company identity', () => {
  for (const selection of [[], ['login-not-privacy'], ['login-not-privacy', 'independent-rpc', 'address-is-identity']]) {
    const preview = trainingPreview('public', selection);
    assert.equal(preview.public!.ledgerExposure, true);
    assert.equal(preview.public!.realCompanyIdentity, 'requires-external-mapping');
    assert.equal(preview.edges.find(item => item.to === 'rpc')?.active, true);
  }
  assert.equal(trainingPreview('public', ['login-not-privacy']).public!.loginHidden, true);
  assert.equal(trainingPreview('public', ['address-is-identity']).nodes.find(item => item.id === 'identity')?.state, 'warning');
});

test('host data and signing paths remain distinct even when their trust conditions are not selected', () => {
  const empty = trainingPreview('trust', []);
  assert.equal(empty.edges.find(item => item.to === 'host')?.active, true);
  assert.equal(empty.edges.find(item => item.from === 'keys')?.active, true);
  const choices = trainingPreview('trust', ['host-data', 'keys-separate', 'observer-risk']);
  assert.deepEqual(choices.trust, { hostAcknowledged: true, keysSeparated: true, observerRiskAcknowledged: true });
  assert.match(choices.edges.find(item => item.to === 'observer')!.label, /조건부 가정/);
  assert.equal(trainingPreview('trust', ['operator-blind']).nodes.find(item => item.id === 'host')?.state, 'warning');
});

test('all previews are reference-only teaching data with no ledger assessment or reference', () => {
  for (const mission of missions) {
    const preview = trainingPreview(mission.id, mission.correct, { failure: false });
    assert.equal(preview.mode, 'REFERENCE_ONLY');
    assert.equal(preview.trainingOnly, true);
    assert.match(preview.disclaimer, /실제 원장의 실행·조회 근거가 아니며/);
    assert.equal('assessment' in preview, false);
    assert.equal('evidenceRefs' in preview, false);
    assert.equal('byBackend' in preview, false);
    assert.ok(preview.cards.length >= 3);
    const nodes = new Set(preview.nodes.map(item => item.id));
    for (const edge of preview.edges) assert.ok(nodes.has(edge.from) && nodes.has(edge.to));
  }
});
