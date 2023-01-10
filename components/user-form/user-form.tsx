import { FC, useState } from "react"
import PersonIcon from "@mui/icons-material/Person"
import EmailIcon from "@mui/icons-material/Email"
import HomeIcon from "@mui/icons-material/Home"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { User } from "../../pages"
import useMeasure from "react-use-measure"
import { useSpring, a } from "@react-spring/web"
import * as Collapsible from "@radix-ui/react-collapsible"
import s from "./user-form.module.css"
import cn from "clsx"
import Phone from "./phone"

const UserForm: FC<{ user: User}> = ({ user }) => {
  const [addressRef, { height: viewHeight }] = useMeasure()
  const [open, setOpen] = useState(false)
  const animProps = useSpring({
    height: open ? viewHeight : 0,
    config: { tension: 250, friction: 32, clamp: true, duration: 150 },
    opacity: open ? 1 : 0,
  })

  return (
    <form className="flex flex-col space-y-2">
      <div className="rounded-2xl flex justify-start bg-accent-2 items-center">
        <div className="p-4">
          <PersonIcon/>
        </div>
        <div className="flex flex-col">
          <label htmlFor="Name" className="text-sm text-left text-accent-6 font-medium"> Name </label>
          <input id="Name" value={user.name} className="bg-inherit outline-none"/>
        </div>
      </div>
      <div className="rounded-2xl flex justify-start bg-accent-2 items-center">
        <div className="p-4">
          <EmailIcon/>
        </div>
        <div className="flex flex-col">
          <label htmlFor="Email" className="text-sm text-left text-accent-6 font-medium"> Email </label>
          <input id="Email" disabled value={user.email} className="bg-inherit outline-none"/>
        </div>
      </div>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
        className="rounded-2xl flex flex-col bg-accent-2"
      >
        <Collapsible.Trigger>
          <div className="flex items-center justify-between">
            <div className="p-4">
              <HomeIcon/>
            </div>
            <div className="text-sm text-left text-accent-8 font-medium ">
              Location details
            </div>
            <ExpandMoreIcon className={cn(s.icon, { [s.open]: open })}/>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content forceMount asChild>
          <a.div style={{ overflow: "hidden", ...animProps }}>
            <div ref={addressRef} className="flex flex-col p-2 space-y-2">
              <div className="rounded-2xl flex flex-col bg-accent-1 px-4">
                <label htmlFor="Street" className="text-sm text-left text-accent-6 font-medium"> Street </label>
                <input id="Street" value={user.address?.street} className="bg-inherit outline-none"/>
              </div>
              <div className="rounded-2xl flex flex-col bg-accent-1 px-4">
                <label htmlFor="Apartament" className="text-sm text-left text-accent-6 font-medium"> Apartament </label>
                <input id="Apartament" value={user.address?.apartament} className="bg-inherit outline-none"/>
              </div>
              <div className="rounded-2xl flex flex-col bg-accent-1 px-4">
                <label htmlFor="City" className="text-sm text-left text-accent-6 font-medium"> City </label>
                <input id="City" value={user.address?.city} className="bg-inherit outline-none"/>
              </div>
              <div className="rounded-2xl flex flex-col bg-accent-1 px-4">
                <label htmlFor="State" className="text-sm text-left text-accent-6 font-medium"> State </label>
                <input id="State" value={user.address?.state} className="bg-inherit outline-none"/>
              </div>
              <div className="rounded-2xl flex flex-col bg-accent-1 px-4">
                <label htmlFor="Country" className="text-sm text-left text-accent-6 font-medium"> Country </label>
                <input id="Country" value={user.address?.country} className="bg-inherit outline-none"/>
              </div>
              <div className="rounded-2xl flex flex-col bg-accent-1 px-4">
                <label htmlFor="Zip code" className="text-sm text-left text-accent-6 font-medium"> Zip code </label>
                <input id="Zip code" value={user.address?.zipCode} className="bg-inherit outline-none"/>
              </div>
              <div className="rounded-2xl flex flex-col bg-accent-1 px-4">
                <label htmlFor="Phone" className="text-sm text-left text-accent-6 font-medium"> Phone </label>
                <Phone number={user.phone} />
              </div>
            </div>
          </a.div>
        </Collapsible.Content>
      </Collapsible.Root>
    </form>
  )
}

export default UserForm