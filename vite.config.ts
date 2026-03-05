import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

// Simple Vite middleware to simulate Vercel serverless functions locally
function vercelApiMock() {
  return {
    name: 'vercel-api-mock',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/')) {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const pathname = url.pathname;
            
            // Try exact match .ts
            let filePath = path.join(process.cwd(), pathname + '.ts');
            
            // Try index.ts in directory
            if (!fs.existsSync(filePath)) {
               filePath = path.join(process.cwd(), pathname, 'index.ts');
            }
            
            // Try dynamic route [id].ts
            if (!fs.existsSync(filePath)) {
              const parts = pathname.split('/').filter(Boolean);
              if (parts.length > 1) {
                const parentDir = path.join(process.cwd(), ...parts.slice(0, -1));
                if (fs.existsSync(parentDir)) {
                  const files = fs.readdirSync(parentDir);
                  const dynamicFile = files.find(f => f.startsWith('[') && f.endsWith('].ts'));
                  if (dynamicFile) {
                    filePath = path.join(parentDir, dynamicFile);
                    const paramName = dynamicFile.slice(1, -5);
                    req.params = { [paramName]: parts[parts.length - 1] };
                  }
                }
              }
            }

            if (fs.existsSync(filePath)) {
              let body = '';
              req.on('data', (chunk: any) => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  req.body = body ? JSON.parse(body) : {};
                } catch(e) {
                  req.body = body;
                }
                req.query = Object.fromEntries(url.searchParams);
                
                // Mock Vercel res methods
                res.status = (code: number) => { res.statusCode = code; return res; };
                res.json = (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };
                res.send = (data: any) => {
                  res.end(data);
                };

                // Load module
                const module = await server.ssrLoadModule(filePath);
                if (module.default) {
                  await module.default(req, res);
                } else {
                  res.status(404).end('Not Found');
                }
              });
              return;
            }
          } catch (e) {
            console.error('API Mock Error:', e);
            res.statusCode = 500;
            res.end('Internal Server Error');
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), vercelApiMock()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'process.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(env.VITE_FIREBASE_DATABASE_URL),
      'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
      'process.env.BLOB_READ_WRITE_TOKEN': JSON.stringify(env.BLOB_READ_WRITE_TOKEN),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
