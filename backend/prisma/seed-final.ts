import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get notiftest user
  const user = await prisma.user.findFirst({
    where: { email: 'notiftest@example.com' },
  });

  if (!user) {
    console.log('No users found');
    return;
  }

  console.log(`Seeding notifications for: ${user.email}`);

  // Clear existing
  await prisma.notification.deleteMany({ where: { userId: user.id } });

  // Create notifications
  const notifications = [
    {
      userId: user.id,
      title: 'Heavy rain expected this evening',
      message: 'Light rain is expected between 14:00 and 18:00. Don\'t forget your umbrella!',
      type: 'WEATHER_ALERT' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      userId: user.id,
      title: 'UV index will be very high at 13:00',
      message: 'The UV index is expected to reach 9 between 12:00 and 14:00. Wear sunscreen.',
      type: 'WARNING' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      userId: user.id,
      title: 'Air quality has improved to Moderate',
      message: 'The air quality index has dropped from 120 to 85.',
      type: 'INFO' as const,
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      userId: user.id,
      title: 'Strong winds expected tomorrow morning',
      message: 'Wind speeds of up to 45 km/h forecasted.',
      type: 'WEATHER_ALERT' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log(`Created ${notifications.length} notifications`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
