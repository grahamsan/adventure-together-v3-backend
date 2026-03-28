/**
 * Met à jour (ou crée) un compte admin pour les tests locaux / déploiement.
 *
 * Usage (à la racine du backend, avec .env chargé) :
 *   pnpm run seed:admin
 *
 * Dépannage connexion Neon / Postgres :
 * - ETIMEDOUT : pare-feu, VPN, ou IP non autorisée dans le dashboard Neon.
 * - ENETUNREACH (IPv6) : `data-source` force IPv4 (`extra.family`); sinon
 *   `export NODE_OPTIONS=--dns-result-order=ipv4first`.
 * - Postgres local sans SSL : `DATABASE_SSL=false` dans `.env`.
 */
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';
import { UserRole, UserStatus } from '../common/enums';

const ADMIN_EMAIL = 'rbirisso+2@gmail.com';
const ADMIN_PASSWORD = 'admin-password';

async function main(): Promise<void> {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  let user = await repo.findOne({ where: { email: ADMIN_EMAIL } });

  if (user) {
    user.passwordHash = passwordHash;
    user.role = UserRole.ADMIN;
    user.status = UserStatus.ACTIVE;
    user.isEmailVerified = true;
    await repo.save(user);
    console.log(`[seed-admin] Compte existant mis à jour : ${ADMIN_EMAIL} (rôle Admin, mot de passe réinitialisé).`);
  } else {
    user = repo.create({
      email: ADMIN_EMAIL,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      firstName: 'Admin',
      lastName: 'Seed',
    });
    await repo.save(user);
    console.log(`[seed-admin] Compte créé : ${ADMIN_EMAIL} (rôle Admin).`);
  }

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('[seed-admin] Erreur :', err);
  process.exit(1);
});
