import * as Dialog from "@radix-ui/react-dialog"
import { useRouter } from "next/router"
import { useState } from "react"

export default function DesassociatePet() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [password, setPassword] = useState("")

  const router = useRouter()

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { password }
      const response = await fetch(`/api/tags/${router.query.code}/pet`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog.Root
      open={dialogIsOpen}
      onOpenChange={setDialogIsOpen}
    >
      <Dialog.Trigger>
        Disassociate tag from email
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
          <Dialog.Close>
            X
          </Dialog.Close>
          <form
            className="flex flex-col justify-center"
            onSubmit={submit}
          >
            <input
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              value={password}
            />
            <button disabled={!password}>
              Disassociate tag
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
