import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createClient } from '../examples/javascript/client.mjs';

test('initialize, notification, list and search work against a local mock', async () => {
  const calls = [];
  const server = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const message = JSON.parse(body);
    calls.push(message);
    assert.equal(req.headers.authorization, 'Bearer test-only');
    assert.equal(req.headers.accept, 'application/json, text/event-stream');
    if (message.method === 'notifications/initialized') {
      assert.equal(message.id, undefined);
      res.writeHead(202).end();
      return;
    }
    if (message.method !== 'initialize') assert.equal(req.headers['mcp-protocol-version'], '2025-06-18');
    const result = message.method === 'initialize'
      ? { protocolVersion: '2025-06-18', serverInfo: { name: 'Mock' } }
      : message.method === 'tools/list'
        ? { tools: [{ name: 'find_shops' }] }
        : { isError: false, structuredContent: { count: 0, shops: [] }, content: [] };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const client = createClient({ url: 'http://127.0.0.1:' + server.address().port + '/mcp', token: 'test-only' });
    await client.initialize();
    assert.equal((await client.listTools()).tools[0].name, 'find_shops');
    assert.deepEqual(await client.callTool('find_shops', { city: 'Edemissen' }), { count: 0, shops: [] });
    assert.deepEqual(calls.map(x => x.method), ['initialize', 'notifications/initialized', 'tools/list', 'tools/call']);
    assert.equal(calls[3].params.arguments.city, 'Edemissen');
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('HTTP, protocol, envelope and tool failures surface as errors', async () => {
  const make = response => createClient({ url: 'https://example.invalid/mcp', token: 'test-only', fetchImpl: async () => response });
  await assert.rejects(make(new Response('', { status: 401 })).listTools(), /401/);
  await assert.rejects(make(Response.json({ jsonrpc: '2.0', id: 1, error: { code: -32601, message: 'Unknown' } })).listTools(), /-32601/);
  await assert.rejects(make(Response.json({ jsonrpc: '2.0', id: 99, result: {} })).listTools(), /envelope/);
  await assert.rejects(make(Response.json({ jsonrpc: '2.0', id: 1, result: { isError: true, content: [{ type: 'text', text: 'Bad cart' }] } })).callTool('validate_cart', {}), /Bad cart/);
});

test('examples require explicit credentials and secure remote transport', () => {
  assert.throws(() => createClient({}), /Set FOODZWERGE/);
  assert.throws(() => createClient({ url: 'http://example.com/mcp', token: 'test' }), /HTTPS/);
});

test('published catalog has five distinct tools and preserves required cart fields', async () => {
  const tools = JSON.parse(await readFile(new URL('../schemas/tools.json', import.meta.url)));
  assert.equal(tools.length, 5);
  assert.equal(new Set(tools.map(x => x.name)).size, 5);
  for (const tool of tools.filter(x => x.name !== 'find_shops')) assert(tool.inputSchema.required.includes('shop_slug'));
  assert(tools.find(x => x.name === 'validate_cart').inputSchema.properties.items.items.required.includes('type'));
  assert.equal(tools.find(x => x.name === 'create_checkout_handoff').inputSchema.properties.items.items.properties.item_type.type, 'string');
});
