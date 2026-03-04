import React from "react"
import { getSiteSetting } from '@/app/actions'
import ContactClient from './contact-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact AURERXA – Premium Jewelry Boutique in Nashik & Online Support',
  description: 'Connect with AURERXA for bespoke jewelry designs, order updates, and boutique appointments in Nashik. Reach us via Phone, WhatsApp, or Email for luxury service.',
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
