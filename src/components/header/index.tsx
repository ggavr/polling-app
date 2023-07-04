import {Box, Button, Flex, Paper} from '@mantine/core';
import Link from 'next/link';

const Header = () => {
    return (
        <Flex mt={6}>
            <Paper p='xs' radius="md">
                <Link href="/">
                    <Button variant="link">Polls</Button>
                </Link>
            </Paper>

            <Box ml="auto">
                <Link href="/createPoll">
                    <Button variant="light" mr={4}>
                        Create Poll
                    </Button>
                </Link>

            </Box>
        </Flex>
    );
};

export default Header;
