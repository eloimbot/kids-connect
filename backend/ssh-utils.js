// ssh-utils.js
const { Client } = require('ssh2');

function sshExec(host, user, pass, command, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = '', stderr = '';
    let finished = false;
    conn.on('ready', () => {
      conn.exec(command, { pty: true }, (err, stream) => {
        if (err) { conn.end(); return reject(err); }
        stream.on('close', (code) => {
          finished = true;
          conn.end();
          resolve({ code, stdout, stderr });
        }).on('data', (data) => {
          stdout += data.toString();
        }).stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    }).on('error', (e) => {
      if (!finished) reject(e);
    }).connect({
      host,
      port: 22,
      username: user,
      password: pass,
      readyTimeout: timeout,
      tryKeyboard: true
    });
  });
}

module.exports = { sshExec };
