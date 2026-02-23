import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/edustack";
const pool = new Pool({ connectionString: DATABASE_URL });

async function runMigration() {
  try {
    const sqlPath = path.join(process.cwd(), 'migrations', '0000_modern_blue_blade.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by statement breakpoint and execute each statement
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
    
    for (const statement of statements) {
      if (statement) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('✓ Migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
