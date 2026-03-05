import { adminDb, adminAuth } from './_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const profileSnap = await adminDb.collection('profiles').doc(uid).get();
    const profile = profileSnap.exists ? profileSnap.data() : { id: uid, email: decodedToken.email, plan: 'free' };

    const today = new Date().toISOString().split('T')[0];
    const usageSnap = await adminDb.collection('usage_daily')
      .where('userId', '==', uid)
      .where('day', '==', today)
      .limit(1)
      .get();

    const usage = !usageSnap.empty ? usageSnap.docs[0].data() : { generations_count: 0, publishes_count: 0 };

    res.status(200).json({ 
      profile, 
      usage
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
