import { NextRequest, NextResponse } from 'next/server';
import { extractorRegistry } from '@/services/platforms/registry';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'A valid URL is required.',
          code: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    const result = await extractorRegistry.extract(url);

    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Server error while resolving media.',
        code: 'NETWORK_ERROR',
      },
      { status: 500 }
    );
  }
}
