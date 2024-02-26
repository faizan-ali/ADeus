import {serve} from 'https://deno.land/std@0.170.0/http/server.ts';
import OpenAI from 'https://deno.land/x/openai@v4.26.0/mod.ts';

import {corsHeaders} from '../common/cors.ts';
import {ApplicationError, UserError} from '../common/errors.ts';
import {supabaseClient} from '../common/supabaseClient.ts';

async function generateResponse(
    useOpenRouter,
    useOllama,
    openaiClient,
    openRouterClient,
    ollamaClient,
    messages
) {
    let client;
    let modelName;


    if (!process.env.CARBON_API_KEY) {
        console.error('Carbon API key not provided')
        throw new Error('')
    }

    if (useOpenRouter) {
        client = openRouterClient;
        modelName = 'nousresearch/nous-capybara-34b';
    } else if (useOllama) {
        client = ollamaClient;
        modelName = 'mistral';
    } else {
        client = openaiClient;
        modelName = 'gpt-4-0125-preview';
    }

    const {choices} = await client.chat.completions.create({
        model: modelName,
        messages,
    });
    console.log('Completion: ', choices[0]);
    return choices[0].message;
}

const chat = async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {headers: corsHeaders});
    }

    const supabaseAuthToken = req.headers.get('Authorization') ?? '';

    if (!supabaseAuthToken)
        throw new ApplicationError('Missing supabase auth token');
    const supabase = supabaseClient(req, supabaseAuthToken);

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user)
        throw new ApplicationError(
            'Unable to get auth user details in request data'
        );

    const requestBody = await req.json();
    const {messageHistory} = requestBody;

    if (!messageHistory) throw new UserError('Missing query in request data');

    const openaiClient = new OpenAI({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    const useOpenRouter = Boolean(openRouterApiKey); // Use OpenRouter if API key is available

    let openRouterClient;

    if (useOpenRouter) {
        openRouterClient = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: openRouterApiKey,
        });
    }

    const ollamaApiKey = Deno.env.get('OLLAMA_BASE_URL');
    const useOllama = Boolean(ollamaApiKey); // Use Ollama if OLLAMA_BASE_URL is available

    let ollamaClient;
    if (useOllama) {
        ollamaClient = new OpenAI({
            baseURL: Deno.env.get('OLLAMA_BASE_URL'),
            apiKey: 'ollama',
        });
    }

    console.log('messageHistory: ', messageHistory);

    const lastMessage = messageHistory[messageHistory.length - 1].content

    // Embed the last messageHistory message using OpenAI's embeddings API
    const embeddingsResponse = await openaiClient.embeddings.create({
        model: 'text-embedding-ada-002',
        input: lastMessage,
    });

    const embeddings = embeddingsResponse.data[0].embedding;
    console.log('Embeddings:', embeddings);

    // Retrieve records from Supabase based on embeddings similarity
    const {data: relevantRecords, error: recordsError} = await supabase.rpc(
        'match_records_embeddings_similarity',
        {
            query_embedding: JSON.stringify(embeddings),
            match_threshold: 0.8,
            match_count: 100,
        }
    );

    if (recordsError) {
        console.log('recordsError: ', recordsError);
        throw new ApplicationError('Error getting records from Supabase');
    }

    const carbonOptions = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.CARBON_API_KEY}`,
            'Content-Type': 'application/json',
            'customer-id': user.id
        },
        body: JSON.stringify({
            query: lastMessage,
            k: 15,
            hybrid_search: false,
            hybrid_search_tuning_parameters: {weight_a: 0.8, weight_b: 0.5},
            media_type: 'TEXT',
            embedding_model: 'OPENAI'
        })
    }

    const carbonated: string[] = await fetch('https://api.carbon.ai/embeddings', carbonOptions)
        .then(response => response.json())
        .then(data => {
            if (data.detail?.includes("doesn't have permission")) {
                console.error('Permission denied')
                throw new Error('Permission denied')
            }
            return data.documents?.length ? data.documents.filter(d => d.score > 0.79).map(_ => _.content) : []
        })

    console.log('Response from Carbon', carbonated)

    let messages = [
        {
            role: 'system',
            content: `You are a helpful assistant. Below is relevant information about me:
      
      ${relevantRecords.map((r) => r.raw_text).join('\n')}
      ${carbonated.join('\n')}
      
      Based on this information above, answer the last question in the end of our conversation. Below is our conversation: 
`,
        },
        ...messageHistory,
    ];
    console.log('messages: ', messages);

    try {
        const responseMessage = await generateResponse(
            useOpenRouter,
            useOllama,
            openaiClient,
            openRouterClient,
            ollamaClient,
            messages
        );

        return new Response(
            JSON.stringify({
                msg: responseMessage,
            }),
            {
                headers: {...corsHeaders, 'Content-Type': 'application/json'},
                status: 200,
            }
        );
    } catch (error) {
        console.log('Error: ', error);
        throw new ApplicationError('Error processing chat completion');
    }

    return new Response(
        JSON.stringify({
            msg: {role: 'assistant', content: 'Hello from Deno Deploy!'},
        }),
        {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 200,
        }
    );
};

serve(chat);
