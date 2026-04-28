import { NextRequest, NextResponse } from 'next/server';
import { apiJsonError } from '@/lib/api-json-error';
import { getD1 } from '@/lib/d1';
import { distributorSignupSchema } from '@/lib/distributor-validation';
import { sendDistributorApplicationEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request
    const validation = distributorSignupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate reference ID
    const referenceId = `DIST-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Try to save to D1 database if available
    let dbSaveSuccess = false;
    try {
      const db = await getD1();

      if (db) {
        const { saveDistributorSubmission } = await import('@/lib/database');
        const ipAddress =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          request.headers.get('cf-connecting-ip') ||
          undefined;

        const saveResult = await saveDistributorSubmission(
          db,
          data,
          referenceId,
          request.headers.get('user-agent') || undefined,
          ipAddress
        );
        dbSaveSuccess = saveResult.success;
        if (!dbSaveSuccess)
          console.warn('Database save failed:', (saveResult as { error?: string }).error);
      }
    } catch (dbError) {
      console.warn('Database operation failed:', dbError);
    }

    // Send confirmation to applicant + alert to admin
    await sendDistributorApplicationEmails({
      to: data.email,
      fullName: data.fullName,
      companyName: data.companyName,
      phone: data.phone,
      businessType: data.businessType,
      countries: body.countries || [],
      estimatedAnnualVolume: data.estimatedAnnualVolume,
      message: data.message,
    }).catch((e) => console.warn('Failed to send distributor emails:', e));

    // Log submission
    console.log('Distributor signup submission:', {
      referenceId,
      ...data,
      countries: body.countries || [],
      timestamp: new Date().toISOString(),
      databaseSaved: dbSaveSuccess,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully. Check your email for confirmation.',
        referenceId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Distributor signup error:', error);

    return apiJsonError('Internal server error', 500);
  }
}
