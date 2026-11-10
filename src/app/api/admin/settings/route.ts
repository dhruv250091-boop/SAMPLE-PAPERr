import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logAdminAction } from '@/lib/security';
import prisma from '@/lib/prisma';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const settingsList = await prisma.appSettings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settingsList) {
      settingsMap[s.settingKey] = s.settingValue;
    }

    // Never expose raw NVIDIA API Key, only masked presence
    const apiKeyConfigured = Boolean(process.env.NVIDIA_API_KEY && !process.env.NVIDIA_API_KEY.startsWith('nvapi-YOUR_'));

    return NextResponse.json({
      settings: settingsMap,
      apiHealth: {
        nvidiaConfigured: apiKeyConfigured,
        nvidiaModel: process.env.NVIDIA_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct',
        status: apiKeyConfigured ? 'Operational' : 'Key Needed (Using Local Fallback)'
      }
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ('status' in adminCheck) return adminCheck;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    const updates = Object.entries(body as Record<string, string>);

    for (const [key, value] of updates) {
      if (typeof value === 'string') {
        await prisma.appSettings.upsert({
          where: { settingKey: key },
          update: { settingValue: value },
          create: { settingKey: key, settingValue: value }
        });
      }
    }

    await logAdminAction(adminCheck.user.id, 'UPDATE_APP_SETTINGS', {
      updatedKeys: Object.keys(body)
    });

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
