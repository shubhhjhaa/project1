import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    // 1. Try to read fresh from disk (works for local custom server updates)
    try {
        const dbPath = path.join(process.cwd(), 'data.json');
        if (fs.existsSync(dbPath)) {
            const fileContents = fs.readFileSync(dbPath, 'utf-8');
            return NextResponse.json(JSON.parse(fileContents));
        }
    } catch (err) {
        console.warn("Could not read dynamic data.json, falling back...");
    }

    // 2. Fallback for Serverless environments (Vercel/Netlify)
    // Using require ensures Next.js bundles the file properly during build
    try {
        const fallbackDb = require('../../../../data.json');
        return NextResponse.json(fallbackDb);
    } catch (err) {
        console.error("Could not load data.json fallback");
    }

    // 3. Absolute fallback
    return NextResponse.json({ menu: [], coupons: [] });
}
