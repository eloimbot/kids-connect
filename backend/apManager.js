const { Client } = require('ssh2');

async function runCommand(ap, cmd) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(cmd, (err, stream) => {
        if(err) return reject(err);
        let data = '';
        stream.on('data', d => data += d.toString());
        stream.on('close', () => { conn.end(); resolve(data); });
      });
    }).connect({
      host: ap.ip,
      username: ap.user || 'root',
      password: ap.pass || ''
    });
  });
}

module.exports = { runCommand };
