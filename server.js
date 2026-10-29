const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { maxHttpBufferSize: 1e6 });
const PORT = Number(process.env.PORT) || 3000;
const CODE_PATTERN = /^[A-Z0-9_-]{3,16}$/;
const profiles = new Map();

app.disable('x-powered-by');
app.use(express.static(__dirname, { extensions: ['html'] }));
app.get('/health', (_request, response) => response.json({ status: 'ok' }));

io.on('connection', (socket) => {
  socket.on('user:register', (payload, reply = () => {}) => {
    const code = String(payload?.code || '').toUpperCase();
    if (!CODE_PATTERN.test(code)) return reply({ ok: false, error: 'Código no válido.' });
    if (socket.data.code && socket.data.code !== code) socket.leave(`user:${socket.data.code}`);
    socket.data.code = code;
    const name = String(payload?.name || 'Contacto').trim().slice(0, 40) || 'Contacto';
    socket.data.name = name;
    profiles.set(code, { code, name, online: true });
    socket.join(`user:${code}`);
    reply({ ok: true, profile: profiles.get(code) });
  });

  socket.on('user:lookup', (payload, reply = () => {}) => {
    const code = String(payload?.code || '').toUpperCase();
    if (!CODE_PATTERN.test(code)) return reply({ ok: false, error: 'Código no válido.' });
    const profile = profiles.get(code);
    if (!profile) return reply({ ok: false, error: 'No encontramos ese código. La otra persona debe abrir Conecta al menos una vez.' });
    reply({ ok: true, profile });
  });

  socket.on('message:send', (payload = {}, reply = () => {}) => {
    if (!socket.data.code) return reply({ ok: false, error: 'Registra tu perfil primero.' });
    const to = String(payload.to || '').toUpperCase();
    const text = String(payload.text || '').trim();
    if (!CODE_PATTERN.test(to) || to === socket.data.code || !text || text.length > 4000) {
      return reply({ ok: false, error: 'Mensaje o destinatario no válido.' });
    }
    const id = String(payload.id || '').slice(0, 80);
    io.to(`user:${to}`).emit('message:receive', {
      id,
      from: socket.data.code,
      name: socket.data.name,
      text,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
      sentAt: Date.now()
    });
    reply({ ok: true });
  });

  socket.on('disconnect', () => {
    const code = socket.data.code;
    if (code && profiles.has(code)) profiles.set(code, { ...profiles.get(code), online: false });
  });

  for (const event of ['call:invite', 'call:offer', 'call:answer', 'call:ice', 'call:reject', 'call:end']) {
    socket.on(event, (payload = {}) => {
      if (!socket.data.code) return;
      const to = String(payload.to || '').toUpperCase();
      const callId = String(payload.callId || '');
      if (!CODE_PATTERN.test(to) || to === socket.data.code || callId.length > 80) return;
      const { to: _to, ...details } = payload;
      io.to(`user:${to}`).emit(event, { ...details, from: socket.data.code });
    });
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Conecta está listo en http://localhost:${PORT}`);
});
