import {Button, Container, Text, TextInput, useMantineTheme} from '@mantine/core';
import {useState} from 'react';
import Header from "@/components/header";


 const Home = () => {
    const theme = useMantineTheme();

    const [title, setTitle] = useState('Do you like this poll?');
    const [options, setOptions] = useState(['Yes', 'No']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = () => {
        setError("");

        // Validate title
        if (title.length < 5 || title.length > 60) {
            setError("Title must be between 5 and 100 characters");
            return;
        }

        // Validate options
        if (options.some((option) => option.length < 1 || option.length > 60)) {
            setError("Options must be between 1 and 30 characters");
            return;
        }

        type Data = {
            message: string;
            error: boolean;
            data: {
                id: string;
            }
        };

        // API
        fetch("/api/createPoll", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                options,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                const resp: Data = res as any as Data;

                if (resp.error) {
                    setError(resp.message);
                } else {
                    window.location.href = `/poll/${resp.data.id}`;//unique href for voting
                }
            });
    };

    return (
        <Container size="lg">
            <Header/>
            <Container mt={6} p={8}>
                <Text size="xl" mb={4}>
                    Create Poll
                </Text>

                <Text my={4} size="md">
                    Title (Max 60)
                </Text>

                <TextInput
                    placeholder="Poll Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <Text my={4} size="md">
                    Options (Minimum 2, Maximum 10)
                </Text>
                <div>
                    {options.map((option, index) => (
                        <div key={index}>
                            <div style={{display: 'flex'}}>
                                <TextInput
                                    placeholder="Option"
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...options];
                                        newOptions[index] = e.target.value;
                                        setOptions(newOptions);
                                    }}
                                />

                                <div style={{display: 'flex', marginLeft: '8px'}}>
                                    <Button
                                        onClick={() => {
                                            const newOptions = [...options];
                                            newOptions.splice(index, 1);
                                            setOptions(newOptions);
                                        }}
                                        disabled={options.length <= 2}
                                        color={theme.colorScheme === 'dark' ? 'red' : 'blue'}
                                        variant="transparent"
                                    >
                                        Delete
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            const newOptions = [...options];
                                            newOptions.push('');
                                            setOptions(newOptions);
                                        }}
                                        disabled={options.length >= 10 || index !== options.length - 1}
                                        color={theme.colorScheme === 'dark' ? 'teal' : 'green'}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <Text mt={4} color="red">
                        {error}
                    </Text>
                )}

                <Button
                    mt={4}
                    onClick={submit}
                    loading={loading}
                    disabled={loading}
                >
                    Create Poll
                </Button>
            </Container>
        </Container>
    );
};
export default Home