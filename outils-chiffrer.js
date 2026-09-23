/* Chiffre un fichier pour le coffre du site.
   Format : "STAVCOF1" | sel 16 o | iv 12 o | chiffre + marque d'authenticite GCM
   Cle : PBKDF2-SHA256, 1 000 000 tours, 256 bits.
   Le meme format est relu par contrat.html via l'API WebCrypto du navigateur. */
const crypto = require('crypto');
const fs = require('fs');
const [, , source, motdepasse, sortie] = process.argv;
if (!source || !motdepasse || !sortie) {
  console.error('usage : node chiffrer.js <fichier> <motdepasse> <sortie>'); process.exit(1);
}
const TOURS = 1000000;   // doit rester egal a TOURS dans contrat.html
const clair = fs.readFileSync(source);
const sel = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const cle = crypto.pbkdf2Sync(Buffer.from(motdepasse, 'utf8'), sel, TOURS, 32, 'sha256');
const c = crypto.createCipheriv('aes-256-gcm', cle, iv);
const chiffre = Buffer.concat([c.update(clair), c.final()]);
fs.writeFileSync(sortie, Buffer.concat([Buffer.from('STAVCOF1', 'ascii'), sel, iv, chiffre, c.getAuthTag()]));
console.log(sortie, '·', clair.length, 'o en clair →', fs.statSync(sortie).size, 'o chiffres');
