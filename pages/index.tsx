import { authOptions } from "../pages/api/auth/[...nextauth]"
import { unstable_getServerSession } from "next-auth/next"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "../lib/prisma"
import { Pets } from "../components/pets"
import { Address, Pet } from "@prisma/client"
import { Layout } from "../components/layout"
import { useState } from "react"
import UserForm from "../components/user-form/user-form"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export type User = {
  name: string,
  email: string,
  address: Omit<Address, "id" | "userId"> | null
}

export const getServerSideProps: GetServerSideProps<{ pets: Pet[], user: User | null }> = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      props: {
        pets: [],
        user: null
      },
    }
  }

  const userOrNull = await prisma.user.findUnique({
    select: {
      id: true,
      address: true,
    },
    where: {
      email: session.user!.email!,
    },
  })
  const user = userOrNull!

  const pets = await prisma.pet.findMany({
    where: {
      ownerId: user.id,
    },
  })

  return {
    props: {
      pets,
      user: {
        name: session.user!.name!,
        email: session.user!.email!,
        address: user.address,
      }
    },
  }
}

const Home = ({ pets, user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [page, setPage] = useState<"overview" | "user" | "pet">("user")

  return (
    <div className="flex flex-col space-y-4">
      {page === "overview" ? (
        <div className="flex flex-col space-y-4">
          <div>
            <div>
              {user?.name}
            </div>
            <div>
              {user?.email}
            </div>
            {user?.address && (
              <div>
                {user.address.city}, {user.address.state}, {user.address.country}
              </div>
            )}
            <button onClick={(e) => setPage("user")}> View profile </button>
          </div>
          <div>
            {!!pets.length && (
              <div>
                <span> Childrens </span>
                <Pets
                  pets={pets}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        page === "user" && user ? (
          <div className="flex flex-col space-y-2">
            <button onClick={() => setPage("overview")} className="self-start">
              <ArrowBackIcon/>
            </button>
            <UserForm user={user}/>
          </div>
        ) : (
          null
        )
      )}
    </div>
  )
}

Home.Layout = Layout

export default Home
