import { Container, Text, Loader, Paper, Progress, Button } from '@mantine/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Vote = {
    choice: string;
    votes: number;
};

type Poll = {
    title: string;
    choices: string[];
    id: string;
};

const Poll: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [poll, setPoll] = useState<Poll>({} as Poll);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        if (document.cookie.includes(`voted_${id}`)) {
            setVoted(true);
        }

        if (id) {
            fetch('/api/getPoll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            })
                .then((res) => res.json())
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error retrieving poll:', error);
                        return;
                    }

                    if (!data || !data.choices || !Array.isArray(data.choices)) {
                        console.error('Invalid poll data received:', data);
                        return;
                    }

                    setPoll(data);
                    setLoading(false);

                    const votes: Vote[] = [];

                    data.choices.forEach((choice: string) => {
                        const obj = {
                            choice,
                            votes: data.votes.filter((vote: Vote) => vote.choice === choice).length,
                        };

                        votes.push(obj);
                    });

                    setVotes(votes);
                    setTotalVotes(data.votes.length);
                })
                .catch((error) => {
                    console.error('Error retrieving poll:', error);
                });
        }
    }, [id]);

    function castVote(option: string) {
        fetch('/api/castVote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({  id: poll.id, option }),
        })
            .then((res) => res.json())
            .then(({ data }) => {
                const votes: Vote[] = [];

                poll.choices.forEach((choice) => {
                    const obj = {
                        choice,
                        votes: data.filter((vote: Vote) => vote.choice === choice).length,
                    };

                    votes.push(obj);
                });

                setVotes(votes);
                setVoted(true);
                setTotalVotes(data.length);

                document.cookie = `voted_${id}=true`;
            })
            .catch((error) => {
                console.error('Error casting vote:', error);
            });
    }

    return (
        <Container size="lg">
            <Container size="md" mt={6}>
                {loading ? (
                    <Loader size="xl" />
                ) : (
                    <Paper shadow="xs" radius="xl">
                        <Text size="lg" weight={700} style={{ marginBottom: '1rem' }}>
                            {poll.title}
                        </Text>

                        {voted ? (
                            <div>
                                {poll.choices.map((option, index) => (
                                    <div key={index} style={{ position: 'relative', marginBottom: '10px' }}>
                                        <Progress
                                            color={index === votes.findIndex((vote) => vote.choice === option) ? 'blue' : 'gray'}
                                            value={votes.find((vote) => vote.choice === option)?.votes}
                                            style={{ height: '8px' }}
                                        />
                                        <Text
                                            size="sm"
                                            style={{ position: 'absolute', top: 0, marginTop: '0.25rem', marginLeft: '0.5rem' }}
                                        >
                                            {option} ({votes.find((vote) => vote.choice === option)?.votes || 0})
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div >
                                {poll.choices?.map((option) => (
                                    <Button
                                        key={option}
                                        onClick={() => castVote(option)}
                                        loading={loading}
                                        disabled={loading}
                                        style={{ marginRight: '40px' }}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </Paper>
                )}
            </Container>
        </Container>
    );
};

export default Poll;
