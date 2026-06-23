import React from 'react'
import { Button } from '@radix-ui/themes'
import Link from 'next/link'
const Issues = () => {
  return (
    <div className='max-w-xl'>

      <Button>
        <Link href="/issues/new">
        
        New Issues
        </Link></Button>
    </div>
  )
}

export default Issues
