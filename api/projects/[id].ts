import { adminDb, adminAuth } from '../_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  const id = req.params?.id || req.query?.id;
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

  if (req.method === 'GET') {
    try {
      const snapshot = await adminDb.ref(`projects/${id}`).once('value');
      if (!snapshot.exists()) return res.status(404).json({ error: 'Not found' });
      
      const data = snapshot.val();
      if (data?.userId !== user.uid) return res.status(403).json({ error: 'Forbidden' });
      
      return res.status(200).json({ id: snapshot.key, ...data });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    const { name, prompt, html, settings_json, pages_json } = req.body;
    try {
      const projectRef = adminDb.ref(`projects/${id}`);
      const snapshot = await projectRef.once('value');
      if (!snapshot.exists()) return res.status(404).json({ error: 'Not found' });
      if (snapshot.val()?.userId !== user.uid) return res.status(403).json({ error: 'Forbidden' });

      const updateData = {
        name,
        prompt,
        html,
        settings_json,
        pages_json,
        updated_at: new Date().toISOString()
      };
      
      await projectRef.update(updateData);
      return res.status(200).json({ id, ...updateData });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const projectRef = adminDb.ref(`projects/${id}`);
      const snapshot = await projectRef.once('value');
      if (!snapshot.exists()) return res.status(404).json({ error: 'Not found' });
      if (snapshot.val()?.userId !== user.uid) return res.status(403).json({ error: 'Forbidden' });

      await projectRef.remove();
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
