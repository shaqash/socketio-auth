import fetch from 'isomorphic-unfetch';
import client from 'socket.io-client';

export async function fetchTokenFromExpress(url, data) {
  const res = await fetch(`${url}/api/token`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { token } = await res.json();
  return token;
}

export function connect(url, token) {
  const socket = client.connect(url, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    query: { token },
  });
  return socket;
}

export default { fetchTokenFromExpress };
