import { NextRequest, NextResponse } from 'next/server';
import { distributorSignupSchema } from '@/lib/distributor-validation';
import { sendDistributorConfirmationEmail, sendDistributorNotificationEmail } from '@/lib/email';

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
      // Access D1 database from Cloudflare Worker context
      // This will be available during production deployment
      const env = process.env as any;
      if (env.DB) {
        const { saveDistributorSubmission } = await import('@/lib/database');
        
        // Extract IP address from headers
        const ipAddress = 
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          request.headers.get('cf-connecting-ip') ||
          undefined;
        
        const saveResult = await saveDistributorSubmission(
          env.DB,
          data,
          referenceId,
          request.headers.get('user-agent') || undefined,
          ipAddress
        );
        dbSaveSuccess = saveResult.success;
        if (!dbSaveSuccess) {
          console.warn('Database save failed:', saveResult.error);
        }
      } else {
        console.log('D1 database not available in this environment');
      }
    } catch (dbError) {
      console.warn('Database operation failed:', dbError);
      // Continue anyway - we have email as fallback
    }

    // Send confirmation email to applicant
    const confirmationResult = await sendDistributorConfirmationEmail(data);
    
    if (!confirmationResult.success) {
      console.warn('Failed to send confirmation email:', confirmationResult.error);
    }

    // Send notification email to admin
    const notificationResult = await sendDistributorNotificationEmail({
      ...data,
      countries: body.countries || [],
    });

    if (!notificationResult.success) {
      console.warn('Failed to send admin notification:', notificationResult.error);
    }

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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

