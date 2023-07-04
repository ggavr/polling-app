import { NextApiRequest, NextApiResponse } from 'next';
import faunadb, { query as q } from 'faunadb';

const apiKey = process.env.FAUNA_API_KEY || '';
const client = new faunadb.Client({ secret: apiKey });

// type PollData = {
//     ref: {
//         id: string;
//     };
//     ts: number;
//     data: {
//         title: string;
//         choices: string[];
//     };
// };
// type Data = {
//     message: string;
//     error: boolean;
//     data?: PollData;
// };
type PollData = {
    id: string;
    title: string;
    choices: string[];
};

type Data = {
    message: string;
    error: boolean;
    data?: PollData;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // Check if the request is a POST request
    if (req.method !== 'POST') {
        res.status(200).json({ message: 'Method not allowed', error: true });
        return;
    }

    // Check if the parameter `id` is present
    if (!req.body.id) {
        res.status(200).json({ message: 'Missing parameters', error: true });
        return;
    }

    const { id } = req.body;

    try {
        // Get the poll
        const response: { data: PollData } = await client.query(
            q.Get(q.Ref(q.Collection('polls'), id))
        );
        if (!response.data) {
            res.status(200).json({ message: 'Poll not found', error: true });
            return;
        }

        res.status(200).json({ message: 'Poll found', error: false, data: response.data });
    } catch (error) {
        if (error instanceof faunadb.errors.NotFound) {
            res.status(200).json({ message: 'Poll not found', error: true });
        } else {
            res.status(500).json({ message: 'Error retrieving poll', error: true });
        }
    }
}
