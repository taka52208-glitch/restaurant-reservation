import type { ReactNode } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Restaurant } from '@mui/icons-material';

interface PublicLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function PublicLayout({ children, maxWidth = 'sm' }: PublicLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
        py: 4,
      }}
    >
      <Container maxWidth={maxWidth}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              color: 'white',
            }}
          >
            <Restaurant sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700}>
              飲食店予約サイト
            </Typography>
          </Box>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
