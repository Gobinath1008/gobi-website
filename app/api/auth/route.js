import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'gobiUK@008';
const ADMIN_TOKEN = 'gobi-admin-session-token';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        token: ADMIN_TOKEN
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Incorrect Password' 
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 });
  }
}
