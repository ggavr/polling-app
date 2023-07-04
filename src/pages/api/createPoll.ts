import { NextApiRequest, NextApiResponse } from "next";
import faunadb, { query as q } from "faunadb";

const apiKey = process.env.FAUNA_API_KEY || '';
const faunaClient = new faunadb.Client({ secret: apiKey });

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
    if (req.method !== "POST") {
        res.status(200).json({ message: "Method not allowed", error: true });
        return;
    }

    // Check if the parameters `title` and `options` are present
    if (!req.body.title || !req.body.options) {
        res.status(200).json({ message: "Missing parameters", error: true });
        return;
    }

    const { title, options } = req.body;

    // Check if the title is not empty
    if (title.length < 5 || title.length > 60) {
        res.status(200).json({
            message: "Title must be between 5 and 60 characters",
            error: true,
        });
        return;
    }

    // Check if the options are not empty
    if (options.length < 2 || options.length > 10) {
        res.status(200).json({
            message: "You must provide between 2 and 10 options",
            error: true,
        });
        return;
    }

    // Check if the options are not empty
    if (
        options.some((option: string) => option.length < 1 || option.length > 60)
    ) {
        res.status(200).json({
            message: "Options must be between 1 and 60 characters",
            error: true,
        });
        return;
    }

    try {
        // Create the poll
        const response:{ ref: any, data: PollData } = await faunaClient.query(
            q.Create(q.Collection("polls"), {
                data: {
                    title,
                    choices: options,
                },
            })
        );

        res.status(200).json({ message: "Poll created", error: false, data:{ id: response.ref.id, title, choices: options  } });
    } catch (error) {
        res.status(500).json({ message: "Error creating poll", error: true });
    }
}
