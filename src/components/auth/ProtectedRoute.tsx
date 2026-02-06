import { useEffect, useState } from 'react';
import { Center, Loader, Stack, Text, Box } from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({ children, requiredRole = undefined }: ProtectedRouteProps) {
  const { toLogin, toDashboard, to } = useAppRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  useEffect(() => {
    if (isPending) return;

    setIsInitialCheckDone(true);

    if (!session) {
      toLogin();
      return;
    }

    if (!session.user.emailVerified) {
      to(`/auth/verify-otp?email=${encodeURIComponent(session.user.email)}`);
      return;
    }

    // Check role-based access if required
    if (requiredRole) {
      const userRole = (session.user as Record<string, unknown>).role as string | undefined;
      if (!userRole || !requiredRole.includes(userRole)) {
        toDashboard();
      }
    }
  }, [session, isPending, toLogin, toDashboard, requiredRole, to]);

  if (isPending && !isInitialCheckDone) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box pos="relative">
      {isPending && (
        <Box
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader />
        </Box>
      )}
      {children}
    </Box>
  );
}
