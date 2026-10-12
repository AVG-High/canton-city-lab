import test from 'node:test';
import assert from 'node:assert/strict';
import {CURRICULUM_MODE, completeMission, evaluateMission, getXp, isUnlocked, missions, normalizeProgress} from '../src/game/curriculum.ts';

test('six learning puzzles unlock in order and award at most 600 educational XP', () => {
  let progress = normalizeProgress(null);
  for (const [index, mission] of missions.entries()) {
    assert.equal(isUnlocked(progress, mission.id), true);
    if (index < missions.length - 1) {
      const later = missions[index + 1];
      const blocked = completeMission(progress, later.id, later.correct);
      assert.equal(blocked.correct, false);
      assert.equal(blocked.awarded, 0);
      assert.deepEqual(blocked.progress, progress);
    }
    const rejected = completeMission(progress, mission.id, []);
    assert.equal(rejected.correct, false);
    assert.equal(rejected.awarded, 0);
    assert.deepEqual(rejected.progress, progress);
    const solved = completeMission(progress, mission.id, [...mission.correct].reverse());
    assert.equal(solved.correct, true);
    assert.equal(solved.awarded, 100);
    assert.deepEqual(progress.completed, missions.slice(0, index).map(item => item.id));
    progress = solved.progress;
    const retry = completeMission(progress, mission.id, mission.correct);
    assert.equal(retry.correct, true);
    assert.equal(retry.awarded, 0);
    assert.deepEqual(retry.progress, progress);
    assert.equal(getXp(progress), (index + 1) * 100);
  }
  assert.equal(getXp(progress), 600);
});

test('visibility requires every positive control and does not credit timeout or bare emptiness', () => {
  assert.equal(evaluateMission('visibility', ['empty-result']).correct, false);
  const required = ['empty-result', 'valid-auth', 'target-exists', 'query-complete'];
  assert.equal(evaluateMission('visibility', required).correct, true);
  for (const missing of required) {
    assert.equal(evaluateMission('visibility', required.filter(item => item !== missing)).correct, false);
  }
  assert.equal(evaluateMission('visibility', [...required, 'timeout']).correct, false);
  assert.equal(evaluateMission('visibility', ['timeout']).correct, false);
});

test('audit disclosure and public EVM answers distinguish reading, execution and confidentiality', () => {
  assert.equal(evaluateMission('boundary', ['seller', 'buyer', 'auditor']).correct, false);
  assert.equal(evaluateMission('boundary', ['seller', 'buyer']).correct, true);
  assert.equal(evaluateMission('audit', ['read-audit', 'read-means-transfer']).correct, false);
  assert.equal(evaluateMission('audit', ['read-audit', 'no-transfer']).correct, true);
  assert.equal(evaluateMission('public', ['login-not-privacy', 'evm-never-private']).correct, false);
  assert.equal(evaluateMission('public', ['login-not-privacy', 'independent-rpc']).correct, true);
  assert.equal(evaluateMission('trust', ['host-data', 'keys-separate', 'observer-risk', 'operator-blind']).correct, false);
  assert.equal(evaluateMission('atomic', ['one-transaction', 'rollback-both', 'unknown']).correct, false);
});

test('stored progress keeps only the canonical completed prefix and ignores forged XP', () => {
  const normalized = normalizeProgress({version: 1, completed: ['public', 'atomic', 'boundary', 'atomic', 'made-up', 'trust'], xp: 99999});
  assert.deepEqual(normalized.completed, ['boundary', 'atomic']);
  assert.equal(getXp(normalized), 200);
  assert.equal(isUnlocked(normalized, 'visibility'), true);
  assert.equal(isUnlocked(normalized, 'audit'), false);
  assert.deepEqual(normalizeProgress({version: 1, completed: ['atomic', 'trust']}).completed, []);
  assert.deepEqual(normalizeProgress({version: 2, completed: ['boundary']}).completed, []);
  assert.deepEqual(normalizeProgress({completed: ['boundary']}).completed, []);
  assert.deepEqual(normalizeProgress(['boundary']).completed, []);
});

test('profile normalization constrains invalid local storage without breaking Unicode callsigns', () => {
  assert.equal(normalizeProgress({callsign: '  야간\n  요원\u202e  ', avatar: 3}).callsign, '야간 요원');
  assert.equal(normalizeProgress({callsign: '   ', avatar: -1}).callsign, 'GHOST-01');
  assert.equal(normalizeProgress({avatar: 1.2}).avatar, 0);
  assert.equal(normalizeProgress({avatar: 4}).avatar, 0);
  assert.equal(normalizeProgress({avatar: '2'}).avatar, 0);
  assert.equal(normalizeProgress({avatar: 2}).avatar, 2);
  assert.equal([...normalizeProgress({callsign: '🌙'.repeat(20)}).callsign].length, 16);
});

test('puzzle success never returns a ledger assessment or consumes a supplied evidence result', () => {
  assert.equal(CURRICULUM_MODE, 'REFERENCE_ONLY');
  const progress = normalizeProgress({version: 1, completed: [], assessment: 'MET', evidenceRefs: ['forged'], byBackend: {'canton-selective': {privacy: {assessment: 'MET'}}}});
  assert.deepEqual(progress.completed, []);
  const result = completeMission(progress, 'boundary', ['seller', 'buyer']);
  assert.match(result.message, /교육 퍼즐/);
  assert.equal('assessment' in result, false);
  assert.equal('evidenceRefs' in result, false);
  assert.equal('byBackend' in result.progress, false);
  assert.deepEqual(Object.keys(result.progress).sort(), ['avatar', 'callsign', 'completed', 'version']);
});
