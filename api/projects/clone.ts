import { adminDb, adminAuth } from '../_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  
  let user;
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    user = decodedToken;
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const projectRef = adminDb.ref(`projects/${id}`);
    const snapshot = await projectRef.once('value');
    
    if (!snapshot.exists()) return res.status(404).json({ error: 'Not found' });
    const project = snapshot.val();
    if (project?.userId !== user.uid) return res.status(403).json({ error: 'Forbidden' });

    const cloneData = {
      userId: user.uid,
      name: `${project.name} (Clone)`,
      prompt: project.prompt,
      html: project.html,
      settings_json: project.settings_json,
      pages_json: project.pages_json,
      updated_at: new Date().toISOString(),
      createdAt: Date.now()
    };
    
    const cloneRef = adminDb.ref('projects').push();
    await cloneRef.set(cloneData);
    res.status(200).json({ id: cloneRef.key, ...cloneData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
