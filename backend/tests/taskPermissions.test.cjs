const test = require('node:test');
const assert = require('node:assert/strict');
const { canAccessTask, canManageTask, canUpdateTask } = require('../dist/utils/taskPermissions.js');

const task = {
  createdBy: 'creator-id',
  assignee: 'assignee-id',
};

test('task creators can access and manage their tasks', () => {
  const creator = { id: 'creator-id', role: 'user' };
  assert.equal(canAccessTask(creator, task), true);
  assert.equal(canManageTask(creator, task), true);
});

test('assignees can access tasks but cannot manage them', () => {
  const assignee = { id: 'assignee-id', role: 'user' };
  assert.equal(canAccessTask(assignee, task), true);
  assert.equal(canManageTask(assignee, task), false);
  assert.equal(canUpdateTask(assignee, task, ['status']), true);
  assert.equal(canUpdateTask(assignee, task, ['title']), false);
});

test('unrelated users cannot access or manage a task', () => {
  const unrelated = { id: 'other-id', role: 'user' };
  assert.equal(canAccessTask(unrelated, task), false);
  assert.equal(canManageTask(unrelated, task), false);
  assert.equal(canUpdateTask(unrelated, task, ['status']), false);
});

test('admins can access and manage all tasks', () => {
  const admin = { id: 'admin-id', role: 'admin' };
  assert.equal(canAccessTask(admin, task), true);
  assert.equal(canManageTask(admin, task), true);
});
