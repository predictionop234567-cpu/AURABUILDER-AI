import { adminDb, adminAuth } from '../_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    // Simple check for admin role
    if (decodedToken.email !== 'predictionop234567@gmail.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const usersSnap = await adminAuth.listUsers(1000);
    const projectsSnap = await adminDb.ref('projects').once('value');
    const publishesSnap = await adminDb.ref('publishedSites').once('value');

    res.status(200).json({
      usersCount: usersSnap.users.length,
      projectsCount: projectsSnap.numChildren(),
      publishesCount: publishesSnap.numChildren()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
