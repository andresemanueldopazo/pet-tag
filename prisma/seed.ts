import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Andres',
    email: 'andres@prisma.io',
    pets: {
      create: [
        {
          name: 'Luli',
          code: "0",
          tag: {
            create: {
              password: "1234" 
            },
          }
        },
        {
          name: 'Rubia',
          code: "1",
          tag: {
            create: {
              password: "2345" 
            },
          }
        },
      ],
    },
  },
  {
    name: 'Kari',
    email: 'kari@prisma.io',
    pets: {
      create: [
        {
          name: 'Bianca',
          code: "2",
          tag: {
            create: {
              password: "3456" 
            },
          }
        },
      ],
    },
  },
]
const tagData: Prisma.TagCreateInput[] = [
  {
    password: "4567"
  },
  {
    password: "5678"
  }
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  for (const t of tagData) {
    const tag = await prisma.tag.create({
      data: t,
    })
    console.log(`Created tag with id: ${tag.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
