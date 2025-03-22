"use client";

import React from 'react'
import Link from 'next/link'
const page = () => {
  return (
    <div>
    
    <Link href="/behavorial">
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Behavorial
        </button>
      </Link>

      <Link href="/technical">
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Technical
        </button>
      </Link>

    </div>
  )
}

export default page