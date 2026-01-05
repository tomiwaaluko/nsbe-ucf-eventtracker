import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../backend/src/app.module';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Create a singleton instance of the NestJS app
let app: express.Application;
let nestApp: any;

async function createApp(): Promise<express.Application> {
  if (app) {
    return app;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  nestApp = await NestFactory.create(AppModule, adapter, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable validation
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Set global prefix - we'll strip /api from incoming requests before passing to NestJS
  nestApp.setGlobalPrefix('api');

  // Enable CORS - Allow all Vercel deployments
  nestApp.enableCors({
    origin: true, // Allow all origins in serverless environment
    credentials: true,
  });

  await nestApp.init();
  app = expressApp;
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await createApp();
    
    // Strip /api prefix from URL since NestJS adds it back with global prefix
    // Request comes as /api/events, we need /events for NestJS to match /api/events
    const modifiedReq = { ...req };
    if (modifiedReq.url && modifiedReq.url.startsWith('/api')) {
      modifiedReq.url = modifiedReq.url.replace(/^\/api/, '') || '/';
    }
    
    // Handle the request through Express
    return new Promise<void>((resolve) => {
      expressApp(modifiedReq as any, res as any, () => {
        resolve();
      });
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

