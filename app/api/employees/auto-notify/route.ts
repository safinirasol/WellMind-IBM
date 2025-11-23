import { NextResponse } from 'next/server';
import { checkAndNotifyHighRiskEmployees } from '../../../../lib/autoNotification';

/**
 * Automated Notification API
 * POST /api/employees/auto-notify
 * Checks all employees and sends notifications to high-risk cases
 */
export async function POST() {
  try {
    console.log('🤖 Starting automated notification check...');

    const result = await checkAndNotifyHighRiskEmployees();

    return NextResponse.json({
      success: true,
      message: 'Automated notifications processed',
      ...result,
    });
  } catch (error) {
    console.error('❌ Automated notification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process automated notifications',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check notification status
 */
export async function GET() {
  return NextResponse.json({
    service: 'Automated Notification System',
    status: 'active',
    description: 'Monitors employee stress levels and sends automated wellness check-ins',
    cooldownPeriod: '24 hours',
    features: [
      'Real-time high-risk detection',
      'Automated email notifications',
      'Smart cooldown prevention',
      'Hedera audit logging',
    ],
  });
}
