'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Admin Data Fetching
async function getAdminClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch { }
                },
            },
        }
    )
}

async function getServicesData() {
    const supabase = await getAdminClient()

    const [tryOn, goldHarvest, jewelryCare, boutique] = await Promise.all([
        supabase.from('virtual_try_on_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('gold_harvest_leads').select('*').order('created_at', { ascending: false }),
        supabase.from('jewelry_care_appointments').select('*').order('created_at', { ascending: false }),
        supabase.from('boutique_appointments').select('*').order('created_at', { ascending: false }),
    ])

    return {
        tryOn: tryOn.data || [],
        goldHarvest: goldHarvest.data || [],
        jewelryCare: jewelryCare.data || [],
        boutique: boutique.data || []
    }
}

export default async function ServicesAdminPage() {
    const data = await getServicesData()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif text-[#D4AF37]">Service Requests</h1>
                <p className="text-white/60">Manage appointments and leads from service forms.</p>
            </div>

            <Tabs defaultValue="try-on" className="w-full">
                <TabsList className="bg-[#111111] border border-white/10 p-1">
                    <TabsTrigger value="try-on" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Virtual Try-On</TabsTrigger>
                    <TabsTrigger value="harvest" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Gold Harvest</TabsTrigger>
                    <TabsTrigger value="care" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Jewelry Care</TabsTrigger>
                    <TabsTrigger value="boutique" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Boutique Visit</TabsTrigger>
                </TabsList>

                <TabsContent value="try-on">
                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Virtual Try-On Requests</CardTitle>
                            <CardDescription className="text-white/50">Manage virtual session requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="text-white/70">Name</TableHead>
                                        <TableHead className="text-white/70">Contact</TableHead>
                                        <TableHead className="text-white/70">Preferred Date</TableHead>
                                        <TableHead className="text-white/70">Status</TableHead>
                                        <TableHead className="text-white/70 text-right">Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.tryOn.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-white/40 py-8">No requests found</TableCell>
                                        </TableRow>
                                    )}
                                    {data.tryOn.map((item: any) => (
                                        <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium text-white">{item.name}</TableCell>
                                            <TableCell className="text-white/80">
                                                <div>{item.email}</div>
                                                <div className="text-xs text-white/50">{item.phone}</div>
                                            </TableCell>
                                            <TableCell className="text-white/80">
                                                {item.preferred_date ? new Date(item.preferred_date).toLocaleDateString() : 'N/A'}
                                                {item.preferred_time && <span className="text-white/50 ml-2">{item.preferred_time}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0">{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-white/50 text-sm">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="harvest">
                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Gold Harvest Leads</CardTitle>
                            <CardDescription className="text-white/50">Details of interested customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="text-white/70">Name</TableHead>
                                        <TableHead className="text-white/70">Contact</TableHead>
                                        <TableHead className="text-white/70">Monthly Amount</TableHead>
                                        <TableHead className="text-white/70">Status</TableHead>
                                        <TableHead className="text-white/70 text-right">Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.goldHarvest.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-white/40 py-8">No leads found</TableCell>
                                        </TableRow>
                                    )}
                                    {data.goldHarvest.map((item: any) => (
                                        <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium text-white">{item.name}</TableCell>
                                            <TableCell className="text-white/80">
                                                <div>{item.email}</div>
                                                <div className="text-xs text-white/50">{item.phone}</div>
                                            </TableCell>
                                            <TableCell className="text-white/80">
                                                {item.monthly_amount ? `₹${item.monthly_amount}` : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0">{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-white/50 text-sm">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="care">
                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Jewelry Care Requests</CardTitle>
                            <CardDescription className="text-white/50">Service and cleaning appointments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="text-white/70">Name</TableHead>
                                        <TableHead className="text-white/70">Contact</TableHead>
                                        <TableHead className="text-white/70">Service Type</TableHead>
                                        <TableHead className="text-white/70">Date</TableHead>
                                        <TableHead className="text-white/70">Status</TableHead>
                                        <TableHead className="text-white/70 text-right">Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.jewelryCare.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-white/40 py-8">No requests found</TableCell>
                                        </TableRow>
                                    )}
                                    {data.jewelryCare.map((item: any) => (
                                        <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium text-white">{item.name}</TableCell>
                                            <TableCell className="text-white/80">
                                                <div>{item.email}</div>
                                                <div className="text-xs text-white/50">{item.phone}</div>
                                            </TableCell>
                                            <TableCell className="text-white/80 capitalize">{item.service_type}</TableCell>
                                            <TableCell className="text-white/80">
                                                {item.preferred_date ? new Date(item.preferred_date).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0">{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-white/50 text-sm">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="boutique">
                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Boutique Appointments</CardTitle>
                            <CardDescription className="text-white/50">In-store visit schedules.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="text-white/70">Name</TableHead>
                                        <TableHead className="text-white/70">Contact</TableHead>
                                        <TableHead className="text-white/70">Preferred Date</TableHead>
                                        <TableHead className="text-white/70">Reason</TableHead>
                                        <TableHead className="text-white/70">Status</TableHead>
                                        <TableHead className="text-white/70 text-right">Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.boutique.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-white/40 py-8">No appointments found</TableCell>
                                        </TableRow>
                                    )}
                                    {data.boutique.map((item: any) => (
                                        <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium text-white">{item.name}</TableCell>
                                            <TableCell className="text-white/80">
                                                <div>{item.email}</div>
                                                <div className="text-xs text-white/50">{item.phone}</div>
                                            </TableCell>
                                            <TableCell className="text-white/80">
                                                {item.preferred_date ? new Date(item.preferred_date).toLocaleDateString() : 'N/A'}
                                                {item.preferred_time && <span className="text-white/50 ml-2">{item.preferred_time}</span>}
                                            </TableCell>
                                            <TableCell className="text-white/80 truncate max-w-[150px]">{item.visit_reason || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0">{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-white/50 text-sm">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
