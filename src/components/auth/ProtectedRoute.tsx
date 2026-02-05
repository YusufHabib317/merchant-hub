import { useEffect } from 'react';
import {
  Center, Loader, Stack, Text,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({
  children,
  requiredRole = undefined,
}: ProtectedRouteProps) {
  const { toLogin, toDashboard, to } = useAppRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

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

  if (isPending) {
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

  return children;
}
