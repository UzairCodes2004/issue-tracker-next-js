import { TextField, TextArea, Button } from '@radix-ui/themes'
import React from 'react'

const NewIssuePage = () => {
  return (
    <div>
      <TextField.Root placeholder='Title'>
        
      </TextField.Root>
      <TextArea placeholder='Description' className='p-y-5'></TextArea>
      <Button>Submit New Issue</Button>
    </div>
  )
}

export default NewIssuePage
