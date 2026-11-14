const { after, before, beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Task = require('../src/models/Task');

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await Task.deleteMany({});
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Task API', () => {
  it('creates a task with defaults and validates required title', async () => {
    const created = await request(app).post('/api/tasks').send({ title: '  Plan release  ' });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.task.title, 'Plan release');
    assert.equal(created.body.data.task.priority, 'Medium');
    assert.equal(created.body.data.task.status, 'Pending');
    assert.equal((await request(app).post('/api/tasks').send({ description: 'Missing title' })).status, 400);
  });

  it('lists tasks with statistics, pagination, search, filters and sorting', async () => {
    await Task.create([
      { title: 'Write launch notes', description: 'For release', priority: 'High' },
      { title: 'Tidy desk', status: 'Completed', priority: 'Low' },
      { title: 'Review launch plan', priority: 'High' },
      { title: 'Draft roadmap', status: 'In Progress', priority: 'Medium' },
    ]);
    const response = await request(app).get('/api/tasks?search=launch&priority=High&status=Pending&sort=createdAt:asc&limit=1');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.tasks.length, 1);
    assert.equal(response.body.data.pagination.total, 2);
    assert.deepEqual(response.body.data.stats, { total: 4, pending: 2, inProgress: 1, completed: 1 });
    assert.equal(response.body.data.tasks[0].title, 'Write launch notes');
    const inProgress = await request(app).get('/api/tasks?status=In%20Progress');
    assert.equal(inProgress.status, 200);
    assert.equal(inProgress.body.data.tasks[0].title, 'Draft roadmap');
  });

  it('gets one task and returns not found for a valid missing ID', async () => {
    const task = await Task.create({ title: 'Read brief' });
    assert.equal((await request(app).get(`/api/tasks/${task.id}`)).body.data.task.title, 'Read brief');
    assert.equal((await request(app).get(`/api/tasks/${new mongoose.Types.ObjectId()}`)).status, 404);
    assert.equal((await request(app).get('/api/tasks/nope')).status, 400);
  });

  it('updates task fields and rejects invalid values and unknown fields', async () => {
    const task = await Task.create({ title: 'Initial title' });
    const started = await request(app).patch(`/api/tasks/${task.id}`).send({ status: 'In Progress' });
    assert.equal(started.status, 200);
    assert.equal(started.body.data.task.status, 'In Progress');
    const updated = await request(app).patch(`/api/tasks/${task.id}`).send({ title: 'Updated', status: 'Completed' });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.task.status, 'Completed');
    assert.equal((await request(app).patch(`/api/tasks/${task.id}`).send({ priority: 'Urgent' })).status, 400);
    assert.equal((await request(app).patch(`/api/tasks/${task.id}`).send({ admin: true })).status, 400);
    assert.equal((await request(app).patch(`/api/tasks/${task.id}`).send({})).status, 400);
  });

  it('deletes tasks and returns not found for repeated deletion', async () => {
    const task = await Task.create({ title: 'Remove me' });
    assert.equal((await request(app).delete(`/api/tasks/${task.id}`)).status, 200);
    assert.equal((await request(app).delete(`/api/tasks/${task.id}`)).status, 404);
  });

  it('rejects malformed JSON, bad list options and oversized search', async () => {
    const malformed = await request(app).post('/api/tasks').set('Content-Type', 'application/json').send('{"title":');
    assert.equal(malformed.status, 400);
    assert.equal((await request(app).get('/api/tasks?status=Done')).status, 400);
    assert.equal((await request(app).get(`/api/tasks?search=${'x'.repeat(101)}`)).status, 400);
    assert.equal((await request(app).get('/api/tasks?sort=createdAt:asc&sort=dueDate:asc')).status, 400);
  });

  it('exposes a health status that reflects database connectivity', async () => {
    const response = await request(app).get('/api/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.database, 'connected');
  });
});
