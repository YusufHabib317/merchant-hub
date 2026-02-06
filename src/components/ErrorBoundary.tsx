/* eslint-disable react/require-default-props */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Group, Paper, Center } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId?: string;
}

/**
 * Report error to monitoring service
 * In production, this should be replaced with Sentry, LogRocket, or similar
 */
async function reportErrorToMonitoring(error: Error, errorInfo: ErrorInfo): Promise<string> {
  const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`;

  // In production, send to error monitoring service (Sentry, LogRocket, etc.)
  // Example Sentry integration:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     extra: { componentStack: errorInfo.componentStack },
  //   });
  // }

  // For now, log structured error for server-side logging/aggregation
  const errorReport = {
    errorId,
    timestamp: new Date().toISOString(),
    message: error.message,
    name: error.name,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  // eslint-disable-next-line no-console
  console.error('[ErrorBoundary] Error Report:', JSON.stringify(errorReport));

  // Optionally send to your API endpoint for logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      }).catch(() => {
        // Silently fail - don't break the error boundary
      });
    } catch {
      // Silently fail - error reporting should never break the UI
    }
  }

  return errorId;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: undefined,
    };
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report error to monitoring service
    reportErrorToMonitoring(error, errorInfo).then((errorId) => {
      this.setState({ errorId });
    });
  }

  public render() {
    const { hasError, errorId } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Container className="h-screen flex items-center justify-center" size="md" py={80}>
          <Center h="100vh">
            <Paper
              p="xl"
              radius="md"
              withBorder
              shadow="sm"
              style={{ textAlign: 'center', maxWidth: 500 }}
            >
              <Center mb="md">
                <IconAlertTriangle size={50} color="var(--mantine-color-red-6)" />
              </Center>
              <Title order={2} mb="md">
                Something went wrong
              </Title>
              <Text c="dimmed" mb="xl">
                We apologize for the inconvenience. An unexpected error has occurred. Please try
                refreshing the page or contact support if the problem persists.
              </Text>
              {errorId && (
                <Text size="xs" c="dimmed" mb="md" style={{ fontFamily: 'monospace' }}>
                  Error ID: {errorId}
                </Text>
              )}
              <Group justify="center">
                <Button onClick={() => window.location.reload()} variant="filled" color="blue">
                  Refresh Page
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  variant="outline"
                >
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
