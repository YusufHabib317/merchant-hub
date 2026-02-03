import {
  Container,
  Burger,
  Group,
  Box,
  Drawer,
  ScrollArea,
} from '@mantine/core';
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpened, setMobileOpened] = useState(false);

  return (
    <Box>
      <Box
        h={60}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Burger
            opened={mobileOpened}
            onClick={() => setMobileOpened(!mobileOpened)}
            hiddenFrom="sm"
            size="sm"
          />
          <Header />
        </Group>
      </Box>

      <div style={{ display: 'flex' }}>
        <Box
          w={250}
          visibleFrom="sm"
          style={{
            position: 'sticky',
            top: 60,
            height: 'calc(100vh - 60px)',
            borderRight: '1px solid var(--mantine-color-default-border)',
          }}
        >
          <ScrollArea h="100%">
            <Sidebar />
          </ScrollArea>
        </Box>

        <Drawer
          opened={mobileOpened}
          onClose={() => setMobileOpened(false)}
          size={250}
          withCloseButton={false}
          padding="md"
        >
          <Sidebar />
        </Drawer>

        <Box
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 60px)',
          }}
        >
          <Container size="lg" py="md" style={{ flex: 1, width: '100%' }}>
            {children}
          </Container>
          <Footer />
        </Box>
      </div>
    </Box>
  );
}
