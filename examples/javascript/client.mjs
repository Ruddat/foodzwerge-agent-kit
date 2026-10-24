import { pathToFileURL } from 'node:url';

export const PROTOCOL_VERSION = '2025-06-18';

export function createClient({ url, token, fetchImpl = fetch }) {
  if (!url || !token) throw new Error('Set FOODZWERGE_MCP_URL and FOODZWERGE_MCP_TOKEN.');
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) {
    throw new Error('Use HTTPS, or HTTP on localhost for development.');
  }
  if (endpoint.username || endpoint.password) throw new Error('Credentials must use the Authorization header.');
  let nextId = 1;

  async function send(method, params, notification = false) {
    const id = notification ? undefined : nextId++;
    const message = { jsonrpc: '2.0', ...(notification ? {} : { id }), method, ...(params === undefined ? {} : { params }) };
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        ...(method === 'initialize' ? {} : { 'MCP-Protocol-Version': PROTOCOL_VERSION }),
      },
      body: JSON.stringify(message),
    });
    if (notification && response.status === 202) return;
    if (!response.ok) throw new Error('MCP HTTP status ' + response.status);
    const body = await response.json();
    if (body.jsonrpc !== '2.0' || body.id !== id) throw new Error('Invalid MCP response envelope.');
    if (body.error) throw new Error('MCP error ' + body.error.code + ': ' + body.error.message);
    if (!Object.hasOwn(body, 'result')) throw new Error('Missing MCP result.');
    return body.result;
  }

  return {
    async initialize() {
      const result = await send('initialize', {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'foodzwerge-agent-kit-js', version: '0.1.0' },
      });
      if (result.protocolVersion !== PROTOCOL_VERSION) throw new Error('Unsupported negotiated MCP protocol.');
      await send('notifications/initialized', undefined, true);
      return result;
    },
    listTools: () => send('tools/list'),
    async callTool(name, args = {}) {
      const result = await send('tools/call', { name, arguments: args });
      if (result.isError) throw new Error('Tool failed: ' + (result.content?.find(item => item.type === 'text')?.text ?? name));
      return result.structuredContent ?? result.content;
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--city')) throw new Error('Usage: node client.mjs [--city Edemissen]');
  const client = createClient({ url: process.env.FOODZWERGE_MCP_URL, token: process.env.FOODZWERGE_MCP_TOKEN });
  const server = await client.initialize();
  console.log(JSON.stringify({ server: server.serverInfo, tools: await client.listTools() }, null, 2));
  if (args.length) console.log(JSON.stringify(await client.callTool('find_shops', { city: args[1], order_type: 'pickup', limit: 5 }), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
