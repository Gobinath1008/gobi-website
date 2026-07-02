import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'portfolio.json');
const ADMIN_TOKEN = 'gobi-admin-session-token';

function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return null;
  }
}

function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${ADMIN_TOKEN}`;
}

export async function GET() {
  const data = readDb();
  if (data) {
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const newData = await request.json();
    if (!newData || typeof newData !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const success = writeDb(newData);
    if (success) {
      return NextResponse.json({ success: true, message: 'Database updated successfully' });
    }

    return NextResponse.json({ error: 'Failed to write database' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  return POST(request);
}

export async function DELETE(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const fallbackData = {
      hero: {
        title: 'Hi, I\'m Gobinath S',
        subtitle: 'MCA Student',
        desc: 'Enthusiastic MCA (Pursuing) student with a strong foundation in programming, algorithms, and problem-solving.',
        cvLink: 'images/Resume.jpg',
        imgSrc: 'images/gobi.jpeg'
      },
      about: { text: 'Portfolio reset to default content.' },
      skills: { technical: [], soft: [], interests: [], languages: [] },
      projects: [],
      education: [],
      certifications: []
    };

    const success = writeDb(body && typeof body === 'object' ? body : fallbackData);
    if (success) {
      return NextResponse.json({ success: true, message: 'Database cleared successfully' });
    }

    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
