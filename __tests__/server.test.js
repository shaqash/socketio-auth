/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import expect from 'expect.js';
import server from '../server';
import { connect, fetchTokenFromExpress } from '../client';

const PORT = '3000';

const USERDATA = {
  username: 'leet',
  password: '1337',
};

const URL = `http://localhost:${PORT}`;

let socket = {};
const serv = server();


beforeAll((done) => {
  serv.listen(PORT, () => {
    done();
  });
});

afterAll((done) => {
  // Cleanup
  serv.close();
  done();
});

describe('Auth', () => {
  it('Should fetch token', async (done) => {
    const token = await fetchTokenFromExpress(URL, USERDATA);
    expect(token).to.be.string;
    done();
  }, 5000);

  it('Should authenticate', async (done) => {
    const token = await fetchTokenFromExpress(URL, USERDATA);
    socket = connect(URL, token);
    socket.on('connected', ({ decoded: { username, password } }) => {
      expect({ username, password }).to.be.eql(USERDATA);
      done();
    });
  }, 5000);

  it('Should not authenticate', (done) => {
    socket = connect(URL, { query: { token: '123' } });
    socket.on('error', (err) => {
      expect(err).to.be.ok;
      expect(err.type).to.be('authentication_error');
      done();
    });
  }, 5000);
});
