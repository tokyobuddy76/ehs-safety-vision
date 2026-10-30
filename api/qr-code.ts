/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response } from 'express';

/**
 * Serverless API handler connecting to api.qrserver.com
 * Endpoint: GET https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=...
 * No API key required.
 */
export default async function qrCodeHandler(req: Request, res: Response) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const rawData = req.query.data as string | undefined;
    const rawSize = req.query.size as string | undefined;
    const format = req.query.format as string | undefined;
    const isJson = req.query.json === 'true' || format === 'json';

    // Default parameters as specified in prompt
    const dataToEncode = rawData && rawData.trim().length > 0 ? rawData.trim() : 'https://your-app.vercel.app';
    const size = rawSize && /^\d+x\d+$/.test(rawSize) ? rawSize : '240x240';

    // Construct upstream URL to api.qrserver.com
    const upstreamUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
    upstreamUrl.searchParams.set('size', size);
    upstreamUrl.searchParams.set('data', dataToEncode);

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'image/png,image/*',
      },
    });

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        error: 'Failed to generate QR code from upstream service',
        status: upstreamResponse.status,
      });
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return JSON with base64 data URL if requested
    if (isJson) {
      const base64DataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
      return res.status(200).json({
        status: 'ok',
        service: 'api.qrserver.com',
        size,
        data: dataToEncode,
        qrCodeUrl: upstreamUrl.toString(),
        dataUrl: base64DataUrl,
      });
    }

    // Stream the raw PNG image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).send(buffer);
  } catch (error: unknown) {
    console.error('QR code generation error:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({
      error: 'Failed to connect to QR code service',
      details: errMessage,
    });
  }
}
