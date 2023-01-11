import React, { FC } from 'react'
import { MuiTelInput } from 'mui-tel-input'

type Phone = {
  number: string | null,
}

const Phone: FC<Phone> = ({ number }) => {
  const [phone, setPhone] = React.useState(number || '')

  return (
    <MuiTelInput
      value={phone}
      onChange={(number) => setPhone(number)}
      sx={{
        borderWidth: 0,
        top: -15,
        height: 35,
        "& .MuiInputBase-root": {
          paddingLeft: 0,
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderWidth: 0,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderWidth: 0,
        },
      }}
    />
  )
}

export default Phone
