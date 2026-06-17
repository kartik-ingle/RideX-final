'use client'
import React from 'react'
import {motion} from 'motion/react'

function Footer() {
  return (
    <div className='w-full bg-black text-white'>
      <motion.div
        initial = {false}
        whileInView={{opacity: 1, y:0}}
        transition = {{duration: 0.6, ease: "easeOut"}}
        viewport={{once: true}}
        className='max-w-7xl mx-auto px-6 py-16'
      >

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12'>
          <div>
            <h2 className='text-2xl font-bold tracking-wide'>RIDEX</h2>
            <p className='mt-4 text-gray-400 text-sm leading-relaxed'>Book any vehicle - from bikes to trucks.
               Trusted owners. Transport pricing.
            </p>

            
          </div>
        </div>

      </motion.div>
    </div>
  )
}

export default Footer
