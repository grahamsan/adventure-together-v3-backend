import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/user.entity';

config();

// 🔍 Debug temporaire
console.log('Environment variables:');
console.log('HOST:', process.env.DATABASE_HOST);
console.log('PORT:', process.env.DATABASE_PORT);
console.log('USERNAME:', process.env.DATABASE_USERNAME);
console.log('PASSWORD:', process.env.DATABASE_PASSWORD ? '***' : 'UNDEFINED ⚠️');
console.log('DATABASE:', process.env.DATABASE_NAME);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'your_database',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});