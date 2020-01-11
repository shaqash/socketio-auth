import jwt from 'jsonwebtoken';

/**
 * Setting defaults avoiding no-use-before-define with defaults.EXPIRE_IN_MINUTES
 */
const EXPIRE_IN_MINUTES = 60;
const SIGN_OPTIONS = {
  expiresIn: 60 * EXPIRE_IN_MINUTES,
};
const defaults = {
  EXPIRE_IN_MINUTES,
  SIGN_OPTIONS,
  SECRET: process.env.SECRET_TOKEN,
  VERIFY_OPTIONS: {
    timeout: 5000,
  },
};

function authTimeout(socket) {
  setTimeout(() => {
    socket.disconnect('unauthorized');
  }, defaults.VERIFY_OPTIONS.timeout || 5000);
}

const authError = () => {
  const err = new Error('Authentication error');
  err.data = { type: 'authentication_error' };
  return err;
};

/**
 * Authentication middleware
 * @param {Object} options JWT verify/sign options
 * @param {Function} validate
 */
export default function authentication(options, validate) {
  const secret = options.secret || defaults.SECRET;
  const verifyOptions = options.verifyOptions || defaults.VERIFY_OPTIONS;
  const signOptions = options.signOptions || defaults.SIGN_OPTIONS;

  if (!secret) throw new Error('No secret or public key provided');

  /**
   * Socket io auth middleware for verifing tokens
   * @param {SocketIO.Socket} socket Socket
   * @param {Function} next Callback for next middleware
   */
  const socketAuth = (socket, next) => {
    clearTimeout(authTimeout(socket));
    if (socket.handshake.query && socket.handshake.query.token) {
      const { token } = socket.handshake.query;
      jwt.verify(token, secret, verifyOptions, (err, decoded) => {
        if (err || !decoded || !validate(decoded)) return next(authError());
        socket.authData = { decoded, connectedAt: new Date() };
        return next();
      });
    }
    return next(authError());
  };

  /**
   * Routing middleware for creating jwt tokens
   * @param {Request} req Request
   * @param {Response} res Response
   */
  const tokenHandler = (req, res) => {
    if (req && req.method === 'POST') {
      const payload = req.body;
      const token = jwt.sign(payload, secret, signOptions);
      res.json({ token });
    } else {
      res.status(500).send({ error: 'Something failed!' });
    }
  };

  return { socketAuth, tokenHandler };
}
