// prisma/seed.ts

import {
  PrismaClient,
  PlanType,
  CharacterType,
  NsfwTendency,
  AccountStatus,
  Theme,
  Role,
  AITone,
  CreditTransactionType,
} from "../app/generated/prisma";
import charactersData from "../data/characters.json";
import scenesData from "../data/scenes.json"; // 1. Import scene data

const prisma = new PrismaClient();

const plansData = [
  {
    id: PlanType.FREE,
    name: "Free",
    price: 0,
    creditsPerMonth: 300,
    maxCharacters: 3,
    features: [
      "BASIC_MODEL",
      "NO_ADS"
    ],
  },
  {
    id: PlanType.PRO,
    name: "Pro",
    price: 999, // $9.99
    creditsPerMonth: 6000,
    maxCharacters: 25,
    features: [
      "ADVANCED_MODEL", 
      "CUSTOM_INSTRUCTIONS", 
      "ENHANCED_MEMORY",
      "NO_ADS"
    ],
  },
  {
    id: PlanType.ULTIMATE,
    name: "Ultimate",
    price: 1999, // $19.99
    creditsPerMonth: 30000,
    maxCharacters: null, // Unlimited
    features: [
      "ADVANCED_MODEL", 
      "CUSTOM_INSTRUCTIONS",
      "NO_ADS",
      "PRIORITY_SUPPORT",
    ],
  },
];

// Data is inlined for portability
const mainUserData = {
  profile: {
    fullName: "Vlad Moroz",
    preferredName: "Vlad",
    username: "vlad_moroz",
    bio: "AI enthusiast and software developer, building the future of human-computer interaction.",
    pronouns: "he/him",
  },
  account: {
    email: "vlad@workos.com",
  },
  persona: {
    aiTone: "FRIENDLY" as AITone,
    interests: "AI, UI/UX Design, Space Exploration",
    userGoals:
      "To brainstorm new project ideas and learn about complex topics.",
    communicationStyle: "Concise with an option for detail",
    excludedTopics: "Politics",
  },
  preferences: {
    theme: "DARK" as Theme,
    language: "en-us",
    timezone: "America/New_York",
    company: "WorkOS",
  },
  subscription: {
    nextBillingDate: "2025-09-01T10:00:00Z",
    paymentMethod: "Visa",
    paymentMethodLast4: "4242",
  },
};

/**
 * Converts a name or any string into a URL-friendly, lowercase,
 * hyphenated string suitable for image filenames or slugs.
 *
 * @param name The input string to convert.
 * @returns A sanitized, lowercase, hyphenated string.
 *
 * @example
 * nameToImageName('Dr. Kamal Kusum'); // Returns: 'dr-kamal-kusum'
 * nameToImageName('  First  & Last Name! '); // Returns: 'first-last-name'
 * nameToImageName('Character_With_Underscores'); // Returns: 'character-with-underscores'
 */
export function nameToImageName(name: string): string {
  if (!name) {
    return "";
  }

  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return name
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function getCharacterType(name: string, type: string): CharacterType {
  const upperType = type.toUpperCase();
  if (upperType === "HISTORICAL") {
    return name === "Casanova"
      ? CharacterType.ENTERTAINMENT
      : CharacterType.MENTOR;
  }
  if (Object.values(CharacterType).includes(upperType as CharacterType)) {
    return upperType as CharacterType;
  }
  return CharacterType.COMPANION;
}

function getTagsForCharacter(
  character: (typeof charactersData)[0],
  tagMap: Map<string, string>
): { id: string }[] {
  const tagsToConnect: { id: string }[] = [];
  const addTag = (tagName: string) => {
    const tagId = tagMap.get(tagName);
    if (tagId) {
      tagsToConnect.push({ id: tagId });
    }
  };

  if (character.characterType === "Historical") addTag("Historical");
  if (character.characterType === "Entertainment") addTag("Fun");
  if (character.characterType === "Mentor") addTag("Helpful");
  if (character.characterType === "Assistant") addTag("Productivity");
  if (character.name.includes("Dungeon Master")) addTag("Fantasy");
  if (character.nsfwTendency === "high") addTag("Romance");
  if (
    character.description.toLowerCase().includes("sci-fi") ||
    character.description.toLowerCase().includes("starship")
  ) {
    addTag("Sci-Fi");
  }

  return tagsToConnect;
}

async function main() {
  console.log("🌱 Start seeding...");

  console.log("🧹 Deleting existing data...");
  await prisma.user.deleteMany();
  await prisma.character.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.scene.deleteMany();
  await prisma.plan.deleteMany();
  console.log("🗑️ Previous data deleted.");

  console.log("💎 Seeding Plans...");
  await prisma.plan.createMany({
    data: plansData,
  });
  console.log(` > Created ${plansData.length} plans.`);

  const proPlanCredits = plansData.find(
    (p) => p.id === PlanType.PRO
  )!.creditsPerMonth;

  const mainUser = await prisma.user.create({
    data: {
      email: mainUserData.account.email,
      name: mainUserData.profile.fullName,
      image: "/users/default-user-01.jpg",
      username: mainUserData.profile.username,
      role: Role.ADMIN,
      credits: proPlanCredits,
      profile: {
        create: {
          preferredName: mainUserData.profile.preferredName,
          bio: mainUserData.profile.bio,
          pronouns: mainUserData.profile.pronouns,
          accountStatus: AccountStatus.ACTIVE,
        },
      },
      persona: { create: mainUserData.persona },
      preferences: { create: mainUserData.preferences },
      subscription: {
        create: {
          ...mainUserData.subscription,
          nextBillingDate: new Date(mainUserData.subscription.nextBillingDate),
          planId: PlanType.PRO,
        },
      },
    },
    include: { profile: true },
  });
  console.log(
    `👤 Created main user:${mainUser.id} ${mainUser.profile?.preferredName} (${mainUser.email})`
  );

  await prisma.creditTransaction.create({
    data: {
      userId: mainUser.id,
      amount: proPlanCredits,
      type: CreditTransactionType.MONTHLY_ALLOWANCE,
      description: "PRO Plan initial grant",
    },
  });
  console.log(` > Granted ${mainUser.credits} credits to the main user.`);

  const creatorIds = [
    ...new Set(
      charactersData
        .map((c) => c.creatorId)
        .filter((id) => id.startsWith("user-"))
    ),
  ];
  const userCreatorMap = new Map<string, string>();
  const defaultWelcomeCredits = 100;

  for (const creatorId of creatorIds) {
    const newUser = await prisma.user.create({
      data: {
        email: `${creatorId}@example.com`,
        username: creatorId,
        name: `Creator ${creatorId.split("-")[1]}`,
      },
    });
    userCreatorMap.set(creatorId, newUser.id);

    await prisma.creditTransaction.create({
      data: {
        userId: newUser.id,
        amount: defaultWelcomeCredits,
        type: CreditTransactionType.INITIAL_GRANT,
        description: "Welcome bonus",
      },
    });

    console.log(
      `👤 Created placeholder user: ${newUser.email} with ${defaultWelcomeCredits} credits.`
    );
  }

  console.log("🏷️ Creating tags...");
  const tagNames = [
    "Fantasy",
    "Sci-Fi",
    "Historical",
    "Romance",
    "Helpful",
    "Productivity",
    "Fun",
  ];
  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const allTags = await prisma.tag.findMany();
  const tagMap = new Map(allTags.map((tag) => [tag.name, tag.id]));
  console.log(` > Created ${allTags.length} tags.`);

  console.log(`🤖 Creating ${charactersData.length} characters...`);
  for (const char of charactersData) {
    const creatorId = char.creatorId.startsWith("user-")
      ? userCreatorMap.get(char.creatorId)
      : undefined;

    const character = await prisma.character.create({
      data: {
        name: char.name,
        description: char.description,
        image: `/characters/${nameToImageName(char.name)}.jpg`,
        icon: char.icon,
        isPublic: char.isPublic,
        isMainPlatformCharacter: char.isMainPlatformCharacter,
        characterType: getCharacterType(char.name, char.characterType),
        nsfwTendency: char.nsfwTendency.toUpperCase() as NsfwTendency,
        systemInstruction: char.systemInstruction,
        greeting: char.greeting,
        creatorId: creatorId,
        exampleDialogues: {
          create: {
            userInput: "Hello! Tell me about yourself.",
            modelResponse: char.greeting,
          },
        },
        tags: {
          connect: getTagsForCharacter(char, tagMap),
        },
      },
    });
    console.log(` > Created character: ${character.name}`);
  }

  // 3. & 4. Create Scenes from the imported JSON data
  console.log(`🏞️ Creating ${scenesData.length} scenes...`);
  for (const scene of scenesData) {
    await prisma.scene.create({
      data: {
        title: scene.title,
        summary: scene.summary,
        sceneInstruction: scene.sceneInstruction,
        openingMessage: scene.openingMessage,
        image: `/scenes/${nameToImageName(scene.title)}.jpg`,
      },
    });
    console.log(` > Created scene: ${scene.title}`);
  }

  console.log("✅ Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred while seeding the database:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
