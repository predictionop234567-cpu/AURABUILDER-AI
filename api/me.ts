import { adminDb, adminAuth } from './_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const profileSnap = await adminDb.ref(`profiles/${uid}`).once('value');
    const profile = profileSnap.exists() ? profileSnap.val() : { id: uid, email: decodedToken.email, plan: 'free' };

    const today = new Date().toISOString().split('T')[0];
    const usageSnap = await adminDb.ref('usage_daily')
      .orderByChild('userId_day')
      .equalTo(`${uid}_${today}`)
      .once('value');

    const usageData = usageSnap.val();
    const usage = usageData ? Object.values(usageData)[0] : { generations_count: 0, publishes_count: 0 };

    res.status(200).json({ 
      profile, 
      usage
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
