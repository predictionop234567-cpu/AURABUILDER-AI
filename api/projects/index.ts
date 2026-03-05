import { adminDb, adminAuth } from '../_lib/firebase-admin';

export default async function handler(req: any, res: any) {
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

  if (req.method === 'GET') {
    try {
      const snapshot = await adminDb.collection('projects')
        .where('userId', '==', user.uid)
        .orderBy('updated_at', 'desc')
        .get();
      
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(projects);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { name, prompt, html, settings_json, pages_json } = req.body;
    try {
      const projectData = {
        userId: user.uid,
        name: name || 'Untitled Website',
        prompt: prompt || '',
        html: html || '',
        settings_json: settings_json || {},
        pages_json: pages_json || [],
        updated_at: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const docRef = await adminDb.collection('projects').add(projectData);
      return res.status(200).json({ id: docRef.id, ...projectData });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
