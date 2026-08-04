import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get the first user or create a test user
  let user = await prisma.user.findFirst();

  if (!user) {
    console.log('No user found. Creating test user...');
    const passwordHash = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash,
        name: 'Test User',
      },
    });
    console.log(`Created test user: ${user.email}`);
  }

  console.log(`Seeding notifications for user: ${user.email}`);

  // Clear existing notifications for this user
  await prisma.notification.deleteMany({
    where: { userId: user.id },
  });

  // Create sample notifications
  const notifications = [
    {
      userId: user.id,
      title: 'Heavy rain expected this evening',
      message: 'Light rain is expected between 14:00 and 18:00. Don\'t forget your umbrella!',
      type: 'WEATHER_ALERT' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      userId: user.id,
      title: 'UV index will be very high at 13:00',
      message: 'The UV index is expected to reach 9 between 12:00 and 14:00. Wear sunscreen and protective clothing.',
      type: 'WARNING' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      userId: user.id,
      title: 'Air quality has improved to Moderate',
      message: 'The air quality index has dropped from 120 to 85. It\'s now safe for outdoor activities.',
      type: 'INFO' as const,
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      userId: user.id,
      title: 'Strong winds expected tomorrow morning',
      message: 'Wind speeds of up to 45 km/h are forecasted between 06:00 and 10:00. Secure loose outdoor items.',
      type: 'WEATHER_ALERT' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      userId: user.id,
      title: 'System update completed',
      message: 'The weather dashboard has been updated to version 2.1. Check out the new forecast charts!',
      type: 'SYSTEM' as const,
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      userId: user.id,
      title: 'Temperature drop alert',
      message: 'A cold front is approaching. Temperatures will drop by 8°C in the next 6 hours.',
      type: 'WEATHER_ALERT' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log(`Created ${notifications.length} notifications`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
