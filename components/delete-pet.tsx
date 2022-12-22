import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useRouter } from "next/router"
import { useState } from "react"


export function DeletePet() {
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)

  const router = useRouter()

  const deletePet = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/tags/${router.query.code}/pet`, {
        method: "DELETE",
      })
      await router.push("/")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AlertDialog.Root
      open={openDeleteAlert}
      onOpenChange={setOpenDeleteAlert}
    >
      <AlertDialog.Trigger>
        Delete
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="
            fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center
          "
          onClick={() => setOpenDeleteAlert(false)}
        />
        <AlertDialog.Content className="
          fixed z-50 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2
          w-max max-w-full flex flex-col items-center border rounded p-4 bg-primary
        ">
          <AlertDialog.Title>
            Are you sure?
          </AlertDialog.Title>
          <div className="flex space-x-4">
            <AlertDialog.Cancel>
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button onClick={(e) => deletePet(e)}>
                Yes, delete profile pet
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}