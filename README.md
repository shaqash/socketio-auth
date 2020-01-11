# socketio-auth
Socket io jwt authentication middleware.  
Including verifing middleware for socket.io and signing middleware for express.  

## Server side
### Socket io verifing middleware
```javascript
const fakeDB = {
  leet: { password: '1337' },
};

/**
 * Validation example
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

const { socketAuth } = authentication({
  secret: 'YourSecretOrPublicKey',
  verifyOptions: {
    // JWT verify options. see link below
  },
}, validation);

// Socket io authentication using the socketAuth middleware
io.use(socketAuth)
  .on('connection', (socket) => {
    socket.emit('connected', socket.authData);
  });
```
- [Verifing options](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)
### Token signing middleware
>Express example
```javascript
const { tokenHandler } = authentication({
  secret: 'test',
  signOptions: {
    // JWT signing options. see link below
  },
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/token', tokenHandler);
```
- [Sign options](https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
## Client side
### Request token from api
```javascript
const data = {
  username: 'leet',
  password: '1337',
};
const res = await fetch(`/api/token`, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
});
const { token } = await res.json();
```
### Connect with token
```javascript
// Fetch the token like explained above
const token = await fetchToken();
// Connect using the query option token
const socket = client.connect({ query: { token }});
```
Then store the token in memory for reconnects
