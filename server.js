import express from 'express';
import { createServer } from 'http';
import socketio from 'socket.io';
import bodyParser from 'body-parser';
import authentication from './index';

export default function ioServer() {
  const app = express();
  const server = createServer(app);
  const io = socketio(server);

  const fakeDB = {
    leet: { password: '1337' },
  };

  /**
   * Validation implementation
   * @param {*} userdata Decoded data from token
   */
  const validation = (userdata) => {
    const { username, password } = userdata;
    return (
      username
      && password
      && fakeDB[username].password === password
    );
  };

  const { socketAuth, tokenHandler } = authentication({
    secret: 'test',
  }, validation);

  // Socket io authentication using the socketAuth middleware
  io.use(socketAuth)
    .on('connection', (socket) => {
      socket.emit('connected', socket.authData);
    });

  // Express router using the tokenHandler middleware
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use('/api/token', tokenHandler);

  return server;
}
