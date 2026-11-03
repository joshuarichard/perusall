import { prisma } from './db';

async function seed() {
  // Clear existing data in dependency order
  await prisma.annotation.deleteMany();
  await prisma.reading.deleteMany();
  await prisma.user.deleteMany();

  // Create instructors
  const drSmith = await prisma.user.create({
    data: { name: 'Dr. Smith', role: 'instructor' },
  });
  const profJohnson = await prisma.user.create({
    data: { name: 'Prof. Johnson', role: 'instructor' },
  });

  // Create students
  const sarah = await prisma.user.create({
    data: { name: 'Sarah', role: 'student' },
  });
  const michael = await prisma.user.create({
    data: { name: 'Michael', role: 'student' },
  });
  const alex = await prisma.user.create({
    data: { name: 'Alex', role: 'student' },
  });

  // Create readings
  const mlReading = await prisma.reading.create({
    data: {
      title: 'Introduction to Machine Learning',
      description:
        'An overview of machine learning concepts including supervised learning, unsupervised learning, and reinforcement learning. Covers key algorithms and their real-world applications.',
      createdBy: drSmith.id,
    },
  });

  const shakespeareReading = await prisma.reading.create({
    data: {
      title: "Shakespeare's Hamlet: Act III Analysis",
      description:
        'A close reading of Act III of Hamlet, focusing on the "To be or not to be" soliloquy, the play-within-a-play, and Hamlet\'s confrontation with Gertrude.',
      createdBy: profJohnson.id,
    },
  });

  const climateReading = await prisma.reading.create({
    data: {
      title: 'Climate Science: Current Research and Future Projections',
      description:
        'A review of recent climate science research, including global temperature models, carbon cycle feedback loops, and projected impacts on coastal ecosystems.',
      createdBy: drSmith.id,
    },
  });

  // Create annotations
  await prisma.annotation.createMany({
    data: [
      {
        content: "What's the difference between supervised and unsupervised learning?",
        readingId: mlReading.id,
        authorId: sarah.id,
      },
      {
        content:
          'Supervised learning uses labeled data to train models, while unsupervised learning identifies patterns in unlabeled data. Think of it like learning with a teacher vs. exploring on your own.',
        readingId: mlReading.id,
        authorId: michael.id,
      },
      {
        content:
          'The reinforcement learning section reminds me of how game AI works. Is AlphaGo an example of this?',
        readingId: mlReading.id,
        authorId: alex.id,
      },
      {
        content:
          "Hamlet's indecision in the soliloquy mirrors the paralysis of overthinking. Is Shakespeare commenting on intellectualism itself?",
        readingId: shakespeareReading.id,
        authorId: sarah.id,
      },
      {
        content:
          "The play-within-a-play is such a clever narrative device. It's essentially Hamlet running an experiment to test his hypothesis about Claudius.",
        readingId: shakespeareReading.id,
        authorId: alex.id,
      },
      {
        content:
          'The feedback loop between ocean temperature and CO2 absorption is alarming. Are there any proposed interventions that could break this cycle?',
        readingId: climateReading.id,
        authorId: michael.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`  - ${2} instructors`);
  console.log(`  - ${3} students`);
  console.log(`  - ${3} readings`);
  console.log(`  - ${6} annotations`);
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
