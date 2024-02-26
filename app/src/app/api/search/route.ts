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

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CARBON_API_KEY}`,
      'Content-Type': 'application/json',
      'customer-id': customerId
    },
    body: JSON.stringify({
      query: 'tech events in San Francisco',
      k: 50,
      hybrid_search: false,
      hybrid_search_tuning_parameters: { weight_a: 0.8, weight_b: 0.5 },
      media_type: 'TEXT',
      embedding_model: 'OPENAI'
    })
  }

  await fetch('https://api.carbon.ai/embeddings', options)
    .then(response => response.json())
    .then(data => {
      if (data.detail?.includes("doesn't have permission")) {
        console.error('Permission denied')
        throw new Error('Permission denied')
      }

      data.documents?.length && console.log(data.documents.filter(d => d.score > 0.75))
    })
    .catch(err => console.error(err))

  return Response.json({ data: 'done' })
}
