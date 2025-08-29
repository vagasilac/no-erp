import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

admin.initializeApp();

const docaiClient = new DocumentProcessorServiceClient();

export const invoiceOcr = functions
  .region(process.env.FIREBASE_REGION || 'europe-west1')
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const bucketName = object.bucket;
    if (!filePath || !bucketName) return;

    const match = filePath.match(/^orgs\/([^\/]+)\/inbox\/(.+)$/);
    if (!match) return;
    const [, orgId, fileName] = match;

    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(filePath);
    const [buffer] = await file.download();

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const location = process.env.DOCAI_LOCATION;
    const invoiceProcessorId = process.env.DOCAI_INVOICE_PROCESSOR_ID;
    const mimeType = object.contentType || 'application/octet-stream';

    const processorPath =
      mimeType === 'application/pdf'
        ? `projects/${projectId}/locations/${location}/processors/${invoiceProcessorId}`
        : `projects/${projectId}/locations/${location}/processors/ocr`;

    const [result] = await docaiClient.processDocument({
      name: processorPath,
      document: {
        content: buffer.toString('base64'),
        mimeType,
      },
    });

    const data: Record<string, unknown> = {};
    result.document?.entities?.forEach((entity) => {
      const key = entity.type?.toLowerCase();
      if (
        key &&
        ['invoice_id', 'supplier_name', 'invoice_date', 'currency', 'total_amount'].includes(key) &&
        entity.mentionText
      ) {
        data[key] = entity.mentionText;
      }
    });

    const docId = fileName.replace(/\.[^/.]+$/, '');
    await admin.firestore().doc(`orgs/${orgId}/invoices/${docId}`).set(data, { merge: true });

    const destPath = `orgs/${orgId}/processed/${fileName}`;
    await bucket.file(filePath).move(destPath);
  });
