import * as Dialog from "@radix-ui/react-dialog"
import { useRouter } from "next/router"
import { useState } from "react"

export default function RememberEmail() {
  const [rememberEmailIsOpen, setRememberEmailIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const router = useRouter()
  
  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { password }
      const response = await fetch(`/api/tags/${router.query.code}/pet/owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        setEmail((await response.json()).email)
        setPassword("")
      } else {
        setEmail("Incorrect password")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog.Root
      open={rememberEmailIsOpen}
      onOpenChange={setRememberEmailIsOpen}
    >
      <Dialog.Trigger asChild>
        <button
          onClick={() => setEmail("")}
        >
          Remember associated email
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="
            fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center
          "
        />
        <Dialog.Content className="
          fixed z-50 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2
          w-max max-w-full flex flex-col items-center border rounded p-4 bg-primary
        ">
          <Dialog.Close asChild>
            <button
              className="right-self"
              type="button"
            >
              X
            </button>
          </Dialog.Close>
          {email ? (
            email
          ) : (
            <form
              className="flex flex-col justify-center"
              onSubmit={submitData}
            >
              <input
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                value={password}
              />
              <button disabled={!password}>
                Get email
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}