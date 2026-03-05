import { adminDb, adminStorage } from './_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { projectId, html, name, userId } = req.body;

  if (!projectId || !html || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const filename = `publishes/${projectId}-${Date.now()}.html`;
    const bucket = adminStorage.bucket();
    const file = bucket.file(filename);

    await file.save(html, {
      metadata: {
        contentType: 'text/html',
      },
      public: true
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    const publishData = {
      userId,
      projectId,
      url: publicUrl,
      status: 'active',
      createdAt: new Date().toISOString(),
      publishedAt: Date.now()
    };

    const publishRef = adminDb.ref('publishedSites').push();
    await publishRef.set(publishData);
    
    // Also update project with publish URL
    await adminDb.ref(`projects/${projectId}`).update({
      publishURL: publicUrl,
      updated_at: new Date().toISOString()
    });

    res.status(200).json({ success: true, data: { url: publicUrl, publishId: publishRef.key } });
  } catch (error: any) {
    console.error('Publish error:', error);
    res.status(200).json({ success: false, error: error.message || "Publishing failed" });
  }
}
