import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Talanta Stadium API Documentation',
      version: 'development',
      description: 'Development documentation endpoint only. No production partner API, payment initiation endpoint, or live integration contract is currently declared.',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Current application origin; deployment and provider connectivity are not verified.',
      },
    ],
    paths: {},
  };

  return NextResponse.json(openApiSpec, { headers: { 'Cache-Control': 'no-store' } });
}
