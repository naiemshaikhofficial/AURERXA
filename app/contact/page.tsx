import React from "react"
import { getSiteSetting } from '@/app/actions'
import ContactClient from './contact-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | AURERXA Support',
  description: 'Get in touch with the AURERXA concierge for bespoke jewelry inquiries, order support, and boutique appointments.',
}

export default async function ContactPage() {
  const contactConfig = await getSiteSetting('contact_config', {
    phone: "+91 9391032677",
    email: "support@aurerxa.com",
    whatsapp: "+91 9391032677",
    address: "Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605"
  })

  return <ContactClient contactConfig={contactConfig} />
}
