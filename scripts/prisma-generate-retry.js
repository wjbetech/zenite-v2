/*
  Small helper to run `prisma generate` with retries on Windows when the query_engine DLL is locked.
  - Attempts to list and kill node.exe processes (Windows only) to release file locks.
  - Removes `node_modules/.prisma` and `node_modules/.prisma/client` if present.
  - Runs `npx prisma generate` up to several times with a delay.

  Usage: `node scripts/prisma-generate-retry.js`
*/

(async function main() {
  const { execSync, spawnSync } = await import('child_process');
  const fs = await import('fs');
  const path = await import('path');

  function isWindows() {
    return process.platform === 'win32';
  }

  function tryKillNodeProcesses() {
    if (!isWindows()) return;
    try {
      console.log('Listing node.exe processes...');
      const out = execSync('tasklist /FI "IMAGENAME eq node.exe"', { encoding: 'utf8' });
      if (out.includes('node.exe')) {
        console.log(out);
        console.log('Attempting to kill node.exe processes (may require elevation)...');
        try {
          execSync('taskkill /F /IM node.exe', { stdio: 'inherit' });
        } catch {
          console.warn('taskkill failed or requires admin. Continue and attempt removal.');
        }
      } else {
        console.log('No node.exe processes found.');
      }
    } catch (err) {
      console.warn('Failed to list/kill node processes:', String(err));
    }
  }

  function removePrismaDirs() {
    const prismaDir = path.join(process.cwd(), 'node_modules', '.prisma');
    if (!fs.existsSync(prismaDir)) return;
    console.log('Removing', prismaDir);
    try {
      // Use rmSync where available
      fs.rmSync(prismaDir, { recursive: true, force: true });
      console.log('Removed', prismaDir);
    } catch (err) {
      console.warn('Failed to remove .prisma directory:', String(err));
    }
  }

  function runPrismaGenerate() {
    console.log('Running `npx prisma generate`...');
    const res = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit' });
    return res.status === 0;
  }

  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`prisma generate attempt ${attempt}/${maxAttempts}`);
    tryKillNodeProcesses();
    removePrismaDirs();
    const ok = runPrismaGenerate();
    if (ok) {
      console.log('prisma generate succeeded');
      process.exit(0);
    }
    console.warn('prisma generate failed, will retry after delay');
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  console.error(
    'prisma generate failed after retries. Please close programs that may lock files (editors, terminals, Docker) and run `npm run prisma:generate` manually with elevated permissions if necessary.',
  );
  process.exit(1);
})();
