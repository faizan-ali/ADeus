import * as Carbon from 'carbon-connect-js';
import {createClient} from '@supabase/supabase-js'
import {NextRequest} from "next/server";

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams
    const email = params?.get('email')

    if (!email) {
        console.error('No email provided')
        return Response.json({success: false})
    }


    if (!process.env.SUPABASE_API_KEY || !process.env.SUPABASE_URL) {
        console.error('Supabase secrets not provided')
        throw new Error('')
    }

    if (!process.env.CARBON_API_KEY) {
        console.error('Carbon API key not provided')
        throw new Error('')
    }


    console.log(`Fetching account for ${email} and ingesting data`)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY)

    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password: 'orakul'
    })

    if (error) {
        console.error('Error fetching user from supabase', {error})
        return Response.json({success: false})
    }

    console.log(`Calling Carbon with customer id: ${data.user.id}`)

    const {data: carbonData, error: carbonError} = await Carbon.generateAccessToken(
        {
            apiKey: process.env.CARBON_API_KEY,
            customerId: data.user!.id!
        }
    );

    if (carbonError) {
        console.error('Error from Carbon', {error: carbonError})
        return Response.json({success: false})
    }

    const accessToken: string = carbonData.access_token

    try {
        // const res = await Carbon({accessToken})
        const gmailSyncOptions = {
            method: 'POST',
            headers: {
                authorization: `Bearer ${process.env.CARBON_API_KEY}`,
                'Content-Type': 'application/json',
                'customer-id': data.user.id
            },
            body: JSON.stringify({
                filters: {
                    key: 'label',
                    value: 'Fogcity',
                },
                "chunk_size": 10000,
                "chunk_overlap": 500,
                "skip_embedding_generation": false,
                "embedding_model": "OPENAI",
                "generate_sparse_vectors": true,
                "prepend_filename_to_chunks": false
            })
        };
        const res = await fetch('https://api.carbon.ai/integrations/gmail/sync', gmailSyncOptions)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));

        console.log('Synced gmail', res)
    } catch (e) {
        console.error('Error fetching from Carbon', {e})
        return Response.json({success: false})
    }

    return Response.json({success: true})
}