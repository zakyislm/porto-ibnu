import { handler } from './.open-next/server-functions/default/handler.mjs';

const req = new Request('http://localhost:3000/');
const res = await handler(req);
console.log('Status:', res.status);
console.log('Body:', await res.text());
