import faunadb, { query as q } from 'faunadb';
import type { NextApiRequest, NextApiResponse } from 'next';

const apiKey = process.env.FAUNA_API_KEY || '';
const client = new faunadb.Client({ secret: apiKey });

type Vote = {
    choice: string;
    pollId: string;
};

type Poll = {
    data: {
        choices: string[];
    };
};

type VotesResponse = {
    data: Vote[];
};

type Data = {
    message: string;
    error: boolean;
    data?: any;
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

    // Check if the parameter `id` and `option` are present
    if (!req.body.id || !req.body.option) {
        res.status(200).json({ message: 'Missing parameters', error: true });
        return;
    }

    const { id, option } = req.body;

    try {
        // Get the poll
        const poll: Poll = await client.query(
            q.Get(q.Ref(q.Collection('polls'), id))
        );

        // Check if the poll exists
        if (!poll) {
            res.status(200).json({ message: 'Poll not found', error: true });
            return;
        }

        // Check if the option is valid
        const options = poll.data.choices;
        if (!options.includes(option)) {
            res.status(200).json({ message: 'Invalid option', error: true });
            return;
        }

        // Cast the vote
        await client.query(
            q.Create(q.Collection('votes'), {
                data: {
                    choice: option,
                    pollId: id
                }
            })
        );

        // Get all the votes for the poll
        const votes: VotesResponse = await client.query(
            q.Map(
                q.Paginate(q.Match(q.Index('votes_by_pollId'), id)),
                q.Lambda('vote', q.Get(q.Var('vote')))
            )
        );

        res.status(200).json({ message: 'Vote casted', error: false, data: votes.data });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ message: 'Internal Server Error', error: true });
    }
}
