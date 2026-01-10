import { AppDataSource } from '../ormconfig';
import { User } from '../src/users/entities/user.entity';

async function debug() {
  try {
    console.log('Initializing Data Source...');
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);

    console.log('Fetching last 5 users...');
    const users = await repo.find({
      take: 5,
      order: { createdAt: 'DESC' },
    });

    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach((u) => {
        console.log(`Email: ${u.email}`);
        console.log(`Hash:  ${u.passwordHash}`);
        console.log(`Created: ${u.createdAt}`);
        console.log('-------------------');
      });
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error during debug:', error);
  }
}

debug();
