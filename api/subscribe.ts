import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.email({ message: "E-mail inválido" }),
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = subscribeSchema.parse(request.body);

    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const DATACENTER = process.env.MAILCHIMP_DATACENTER; 

    if (!API_KEY || !LIST_ID || !DATACENTER) {
      throw new Error('Server misconfiguration: Missing Env Vars');
    }

    const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

    const data = {
      email_address: email,
      status: 'subscribed',
    };

    await axios.post(url, data, {
      headers: {
        Authorization: `apikey ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.status(201).json({ message: 'Success! Please check your email.' });

  } catch (error: any) {

    if (axios.isAxiosError(error) && error.response) {
      const { title, detail } = error.response.data;
      console.error('Mailchimp Error:', title, detail);

      if (title === 'Member Exists') {
        return response.status(400).json({ error: 'Este e-mail já está inscrito.' });
      }
      
      return response.status(500).json({ error: 'Erro ao conectar com Mailchimp.' });
    }

    if (error instanceof z.ZodError) {
        return response.status(400).json({ error: error.issues[0].message });
    }

    console.error('Server Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}