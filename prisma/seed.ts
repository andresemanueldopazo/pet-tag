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
          parents: {
            create: [
              {
                name: "Andres",
                phone: {
                  create: {
                    number: "+5493541522837",
                    public: false,
                  },
                },
                email: {
                  create: {
                    address: "andresemanueld@gmail.com",
                    public: true,
                  },
                },
              },
              {
                name: "Carolina",
                email: {
                  create: {
                    address: "sotelocarolina909@gmail.com",
                    public: true,
                  },
                },
              },
            ],
          },
          tag: {
            create: {
              code: "0",
              password: "1234" 
            },
          }
        },
        {
          name: 'Rubia',
          tag: {
            create: {
              code: "1",
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
          tag: {
            create: {
              code: "2",
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
    code: "3",
    password: "4567"
  },
  {
    code: "4",
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
