import fs from "fs";

function loadDotEnv() {
  try {
    const dotEnvText = fs.readFileSync(".env", "utf8");
    const lines = dotEnvText.match(/(.+?)=(.+)/gm);
    if (lines) {
      lines.forEach(line => {
        const match = line.match(/(.+?)=(.+)/);
        if (match) {
          const [, key, value] = match;
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (err) {
    console.error("error loading env", err);
  }
}

loadDotEnv();
