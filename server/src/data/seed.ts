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
  const annotations = [
    // ML Reading — discussions over Oct 20-22
    {
      content: "What's the difference between supervised and unsupervised learning?",
      readingId: mlReading.id,
      authorId: sarah.id,
      createdAt: new Date('2026-10-20T09:15:00Z'),
    },
    {
      content:
        'Supervised learning uses labeled data to train models, while unsupervised learning identifies patterns in unlabeled data. Think of it like learning with a teacher vs. exploring on your own.',
      readingId: mlReading.id,
      authorId: michael.id,
      createdAt: new Date('2026-10-20T10:42:00Z'),
    },
    {
      content:
        'The reinforcement learning section reminds me of how game AI works. Is AlphaGo an example of this?',
      readingId: mlReading.id,
      authorId: alex.id,
      createdAt: new Date('2026-10-20T14:03:00Z'),
    },
    {
      content:
        'Yes, AlphaGo is a great example! It learned by playing millions of games against itself. The reward signal was simply winning or losing.',
      readingId: mlReading.id,
      authorId: michael.id,
      createdAt: new Date('2026-10-20T16:28:00Z'),
    },
    {
      content:
        'The bias-variance tradeoff section was really helpful. I finally understand why more complex models can actually perform worse on new data.',
      readingId: mlReading.id,
      authorId: sarah.id,
      createdAt: new Date('2026-10-21T08:55:00Z'),
    },
    {
      content:
        'Can someone explain gradient descent in simpler terms? The math notation lost me around page 12.',
      readingId: mlReading.id,
      authorId: alex.id,
      createdAt: new Date('2026-10-21T20:10:00Z'),
    },
    {
      content:
        "Think of it like rolling a ball downhill — you're trying to find the lowest point (minimum error) by taking steps proportional to the slope.",
      readingId: mlReading.id,
      authorId: sarah.id,
      createdAt: new Date('2026-10-22T11:30:00Z'),
    },
    // Shakespeare Reading — discussions over Oct 23-26
    {
      content:
        "Hamlet's indecision in the soliloquy mirrors the paralysis of overthinking. Is Shakespeare commenting on intellectualism itself?",
      readingId: shakespeareReading.id,
      authorId: sarah.id,
      createdAt: new Date('2026-10-23T13:20:00Z'),
    },
    {
      content:
        "The play-within-a-play is such a clever narrative device. It's essentially Hamlet running an experiment to test his hypothesis about Claudius.",
      readingId: shakespeareReading.id,
      authorId: alex.id,
      createdAt: new Date('2026-10-23T15:45:00Z'),
    },
    {
      content:
        "I think the 'To be or not to be' speech is less about suicide and more about whether it's worth taking action against injustice when the outcome is uncertain.",
      readingId: shakespeareReading.id,
      authorId: michael.id,
      createdAt: new Date('2026-10-24T09:05:00Z'),
    },
    {
      content:
        "The closet scene with Gertrude is fascinating — Hamlet finally acts impulsively (killing Polonius) and it's arguably his worst decision in the entire play.",
      readingId: shakespeareReading.id,
      authorId: sarah.id,
      createdAt: new Date('2026-10-24T17:30:00Z'),
    },
    {
      content:
        "Interesting how Claudius's reaction to the play confirms his guilt but Hamlet still delays. Is this Shakespeare showing that proof alone doesn't drive action?",
      readingId: shakespeareReading.id,
      authorId: alex.id,
      createdAt: new Date('2026-10-25T10:15:00Z'),
    },
    {
      content:
        "The contrast between Hamlet's inaction and Laertes' impulsive revenge later in the play really highlights Shakespeare's exploration of different responses to grief.",
      readingId: shakespeareReading.id,
      authorId: michael.id,
      createdAt: new Date('2026-10-26T14:50:00Z'),
    },
    // Climate Reading — discussions over Oct 28-31
    {
      content:
        'The feedback loop between ocean temperature and CO2 absorption is alarming. Are there any proposed interventions that could break this cycle?',
      readingId: climateReading.id,
      authorId: michael.id,
      createdAt: new Date('2026-10-28T11:00:00Z'),
    },
    {
      content:
        'The section on permafrost thawing was eye-opening. The methane release creates yet another feedback loop that the models are still struggling to quantify.',
      readingId: climateReading.id,
      authorId: sarah.id,
      createdAt: new Date('2026-10-28T14:22:00Z'),
    },
    {
      content:
        "I'm surprised by how much uncertainty there is in the sea level projections. The range between best and worst case is enormous.",
      readingId: climateReading.id,
      authorId: alex.id,
      createdAt: new Date('2026-10-29T09:40:00Z'),
    },
    {
      content:
        'The paper mentions carbon capture technology but seems skeptical about scaling it. Has anyone read more recent literature on direct air capture costs?',
      readingId: climateReading.id,
      authorId: michael.id,
      createdAt: new Date('2026-10-29T16:15:00Z'),
    },
    {
      content:
        'Figure 4 showing coral reef decline projections is devastating. The 1.5°C vs 2°C difference means losing 70% vs 99% of reefs.',
      readingId: climateReading.id,
      authorId: sarah.id,
      createdAt: new Date('2026-10-30T10:05:00Z'),
    },
    {
      content:
        "The economic modeling section felt underdeveloped compared to the physical science. It's hard to put a dollar value on ecosystem collapse.",
      readingId: climateReading.id,
      authorId: alex.id,
      createdAt: new Date('2026-10-31T19:30:00Z'),
    },
  ];

  const createdAnnotations: Record<string, string> = {};
  for (let i = 0; i < annotations.length; i++) {
    const a = await prisma.annotation.create({ data: annotations[i] });
    createdAnnotations[`a${i}`] = a.id;
  }

  // Create threaded replies
  const replies = [
    // Reply to Sarah's supervised/unsupervised question (a0) from Michael
    {
      content: 'Thanks Michael! So would clustering be an example of unsupervised learning?',
      readingId: mlReading.id,
      authorId: sarah.id,
      parentId: createdAnnotations['a0'],
      createdAt: new Date('2026-10-20T11:15:00Z'),
    },
    {
      content:
        'Exactly! K-means clustering is a classic unsupervised algorithm. No labels needed — it just groups similar data points together.',
      readingId: mlReading.id,
      authorId: michael.id,
      parentId: createdAnnotations['a0'],
      createdAt: new Date('2026-10-20T12:30:00Z'),
    },
    // Reply to Alex's AlphaGo question (a2)
    {
      content:
        "That's a great connection! Chess engines like Stockfish use a different approach though — mostly search trees rather than RL.",
      readingId: mlReading.id,
      authorId: sarah.id,
      parentId: createdAnnotations['a2'],
      createdAt: new Date('2026-10-20T15:10:00Z'),
    },
    // Reply to Sarah's Hamlet indecision comment (a7)
    {
      content:
        "I think you're onto something. The whole play can be read as a critique of the intellectual who thinks too much and acts too late.",
      readingId: shakespeareReading.id,
      authorId: michael.id,
      parentId: createdAnnotations['a7'],
      createdAt: new Date('2026-10-23T14:45:00Z'),
    },
    // Reply to Michael's ocean temperature comment (a13)
    {
      content:
        'Iron fertilization of oceans has been proposed but the ecological side effects are largely unknown. Risky intervention.',
      readingId: climateReading.id,
      authorId: alex.id,
      parentId: createdAnnotations['a13'],
      createdAt: new Date('2026-10-28T13:00:00Z'),
    },
  ];

  const createdReplies: Record<string, string> = {};
  for (let i = 0; i < replies.length; i++) {
    const r = await prisma.annotation.create({ data: replies[i] });
    createdReplies[`r${i}`] = r.id;
  }

  // Replies to replies (deeper threads)
  const deepReplies = [
    // Reply to Sarah's clustering question (r0) — continuing the ML thread
    {
      content:
        'Yes, and another example is PCA for dimensionality reduction. Also unsupervised since it finds structure without labels.',
      readingId: mlReading.id,
      authorId: alex.id,
      parentId: createdReplies['r0'],
      createdAt: new Date('2026-10-20T13:00:00Z'),
    },
    // Reply to Michael's K-means explanation (r1)
    {
      content: 'How do you pick the right number of clusters? Is there a standard method?',
      readingId: mlReading.id,
      authorId: sarah.id,
      parentId: createdReplies['r1'],
      createdAt: new Date('2026-10-20T14:00:00Z'),
    },
    {
      content:
        'The elbow method is the most common — you plot the error for different values of k and look for where the curve bends.',
      readingId: mlReading.id,
      authorId: michael.id,
      parentId: createdReplies['r1'],
      createdAt: new Date('2026-10-20T14:45:00Z'),
    },
    // Reply to Michael's Hamlet critique (r3)
    {
      content:
        'That reading also connects to the broader Renaissance anxiety about contemplation vs. action — very Montaigne.',
      readingId: shakespeareReading.id,
      authorId: alex.id,
      parentId: createdReplies['r3'],
      createdAt: new Date('2026-10-23T16:00:00Z'),
    },
    // Reply to Alex's iron fertilization comment (r4)
    {
      content:
        "Agreed — the precautionary principle should apply here. We can't undo large-scale ocean chemistry changes.",
      readingId: climateReading.id,
      authorId: sarah.id,
      parentId: createdReplies['r4'],
      createdAt: new Date('2026-10-28T15:30:00Z'),
    },
  ];

  for (const dr of deepReplies) {
    await prisma.annotation.create({ data: dr });
  }

  console.log('Database seeded successfully!');
  console.log(`  - ${2} instructors`);
  console.log(`  - ${3} students`);
  console.log(`  - ${3} readings`);
  console.log(
    `  - ${20} annotations + ${replies.length} replies + ${deepReplies.length} nested replies`,
  );
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
