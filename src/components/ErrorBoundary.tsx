/* eslint-disable react/require-default-props */
import React, {
  Component,
  ErrorInfo,
  ReactNode,
} from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Center,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Container className="h-screen flex items-center justify-center" size="md" py={80}>
          <Center h="100vh">
            <Paper p="xl" radius="md" withBorder shadow="sm" style={{ textAlign: 'center', maxWidth: 500 }}>
              <Center mb="md">
                <IconAlertTriangle size={50} color="var(--mantine-color-red-6)" />
              </Center>
              <Title order={2} mb="md">
                Something went wrong
              </Title>
              <Text c="dimmed" mb="xl">
                We apologize for the inconvenience. An unexpected error has occurred.
                Please try refreshing the page or contact support if the problem persists.
              </Text>
              <Group justify="center">
                <Button onClick={() => window.location.reload()} variant="filled" color="blue">
                  Refresh Page
                </Button>
                <Button onClick={() => { window.location.href = '/'; }} variant="outline">
                  Go to Home
                </Button>
              </Group>
            </Paper>
          </Center>
        </Container>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
