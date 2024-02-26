import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('id')

  if (!customerId) {
    console.error('No search params found')
    throw new Error('Missing ID')
  }

  if (!process.env.CARBON_API_KEY) {
    throw new Error('Carbon API key not provided')
  }

  console.log('Toggling hybrid search')

  await fetch('https://api.carbon.ai/modify_user_configuration', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.CARBON_API_KEY}`, 'Content-Type': 'application/json', 'customer-id': customerId },
    body: JSON.stringify({ configuration_key_name: 'sparse_vectors', value: { enabled: true } })
  })
    .then(response => response.json())
    .then(response => console.log('Response from enabling sparse vectors', response))
    .catch(e => {
      console.error('Error enabling sparse vectors', { e })
      throw e
    })

  const response: { access_token: string; refresh_token: string } = await fetch('https://api.carbon.ai/auth/v1/access_token', {
    headers: {
      'Content-Type': 'application/json',
      'customer-id': customerId,
      Authorization: `Bearer ${process.env.CARBON_API_KEY}`
    }
  }).then(_ => _.json())

  console.log('Returning access token to client')

  return Response.json(response)
}
