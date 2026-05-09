import https from 'https';
import fs from 'fs';

const file = fs.createWriteStream("public/bubble.mp3");
https.get("https://assets.mixkit.co/active_storage/sfx/2140/2140-preview.mp3", response => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Download completed");
  });
});
