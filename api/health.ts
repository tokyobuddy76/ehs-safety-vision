/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response } from 'express';

export default function healthHandler(_req: Request, res: Response) {
  // Check if GEMINI_API_KEY is configured on the server without exposing the key itself
  const isKeyPresent = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0
  );

  res.status(200).json({
    status: 'ok',
    service: 'EHS Safety Vision Serverless API',
    geminiConfigured: isKeyPresent,
    timestamp: new Date().toISOString(),
  });
}
