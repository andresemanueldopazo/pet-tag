import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Component() {
  const { data: session } = useSession()
  const router = useRouter()

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
        {(router.route !== "/" && router.query.code) && (
          <Link href={"/"}> View childrens </Link>
        )}
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}
