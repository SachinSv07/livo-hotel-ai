import { existsSync, renameSync } from 'node:fs';

const guestHtml = 'dist-guest/guest.html';
const indexHtml = 'dist-guest/index.html';

if (existsSync(guestHtml)) {
  renameSync(guestHtml, indexHtml);
}