import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper to query the DB
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Initialize table (simple migration for now)
export const initDb = async () => {
    await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_no VARCHAR(255) NOT NULL,
      date TIMESTAMP DEFAULT NOW(),
      billing_period VARCHAR(255),
      terms VARCHAR(255),
      seller_details JSONB,
      client_details JSONB,
      items JSONB,
      total_amount NUMERIC,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
