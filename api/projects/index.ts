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
      const snapshot = await adminDb.ref('projects')
        .orderByChild('userId')
        .equalTo(user.uid)
        .once('value');
      
      const data = snapshot.val() || {};
      const projects = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      
      // Sort manually as RTDB doesn't support multiple orderings
      projects.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
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
        createdAt: Date.now()
      };
      
      const newProjectRef = adminDb.ref('projects').push();
      await newProjectRef.set(projectData);
      return res.status(200).json({ id: newProjectRef.key, ...projectData });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
