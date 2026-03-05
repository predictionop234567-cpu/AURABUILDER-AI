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
    const docRef = adminDb.collection('projects').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) return res.status(404).json({ error: 'Not found' });
    const project = docSnap.data();
    if (project?.userId !== user.uid) return res.status(403).json({ error: 'Forbidden' });

    const cloneData = {
      userId: user.uid,
      name: `${project.name} (Clone)`,
      prompt: project.prompt,
      html: project.html,
      settings_json: project.settings_json,
      pages_json: project.pages_json,
      updated_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const cloneRef = await adminDb.collection('projects').add(cloneData);
    res.status(200).json({ id: cloneRef.id, ...cloneData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
