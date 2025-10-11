#!/usr/bin/env node

/**
 * Environment Variable Checker
 * Verifies that all required environment variables are set
 */

const REQUIRED_VARS = {
  production: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_ENV',
  ],
  optional: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_URL',
    'DEFAULT_TASK_OWNER_EMAIL',
    'DEFAULT_TASK_OWNER_NAME',
  ],
};

console.log('🔍 Checking Environment Variables...\n');

let hasErrors = false;

// Check required variables
console.log('📋 Required Variables:');
REQUIRED_VARS.production.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value
    ? varName.includes('SECRET') || varName.includes('KEY')
      ? '***set***'
      : `"${value.substring(0, 20)}..."`
    : 'NOT SET';

  console.log(`  ${status} ${varName}: ${display}`);

  if (!value) {
    hasErrors = true;
  }
});

console.log('\n📋 Optional Variables:');
REQUIRED_VARS.optional.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const display = value
    ? varName.includes('SECRET') || varName.includes('KEY')
      ? '***set***'
      : `"${value.substring(0, 20)}..."`
    : 'not set';

  console.log(`  ${status} ${varName}: ${display}`);
});

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ MISSING REQUIRED VARIABLES!');
  console.log('\nTo fix:');
  console.log('1. Add missing variables to your .env.production.local file');
  console.log('2. Add them to Vercel: Settings → Environment Variables');
  console.log('3. See QUICK_FIX.md for detailed instructions');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
  process.exit(0);
}
