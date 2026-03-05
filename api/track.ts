import { adminDb } from './_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { publishId, eventName, userId } = req.body;

  try {
    const analyticsRef = adminDb.ref('analytics').push();
    await analyticsRef.set({
      userId,
      publishId,
      eventName,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
