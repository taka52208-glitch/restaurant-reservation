import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { Event, AccessTime, People } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Mock reservations
const MOCK_RESERVATIONS = [
  {
    id: '1',
    restaurantName: '和食処 さくら',
    date: '2025-01-05',
    time: '18:00',
    partySize: 4,
    status: 'confirmed',
    paymentMethod: 'online',
    amount: 20000,
  },
  {
    id: '2',
    restaurantName: 'イタリアン ベラビスタ',
    date: '2025-01-10',
    time: '19:30',
    partySize: 2,
    status: 'confirmed',
    paymentMethod: 'onsite',
    amount: 15000,
  },
  {
    id: '3',
    restaurantName: '焼肉 牛兵衛',
    date: '2024-12-20',
    time: '19:00',
    partySize: 6,
    status: 'completed',
    paymentMethod: 'online',
    amount: 45000,
  },
];

export function MyPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const upcomingReservations = MOCK_RESERVATIONS.filter(
    (r) => r.status === 'confirmed'
  );
  const pastReservations = MOCK_RESERVATIONS.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled'
  );

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Chip label="予約確定" color="success" size="small" />;
      case 'completed':
        return <Chip label="来店済み" color="default" size="small" />;
      case 'cancelled':
        return <Chip label="キャンセル" color="error" size="small" />;
      default:
        return null;
    }
  };

  const getPaymentChip = (method: string) => {
    return method === 'online' ? (
      <Chip label="事前決済" color="primary" size="small" variant="outlined" />
    ) : (
      <Chip label="現地払い" color="secondary" size="small" variant="outlined" />
    );
  };

  const reservationsToShow =
    tabValue === 0 ? upcomingReservations : pastReservations;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        マイページ
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        ようこそ、{user?.name}さん
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            予約履歴
          </Typography>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label={`今後の予約 (${upcomingReservations.length})`} />
            <Tab label={`過去の予約 (${pastReservations.length})`} />
          </Tabs>

          {reservationsToShow.length === 0 ? (
            <Box textAlign="center" py={4} color="text.secondary">
              <Typography>
                {tabValue === 0
                  ? '今後の予約はありません'
                  : '過去の予約履歴はありません'}
              </Typography>
            </Box>
          ) : (
            reservationsToShow.map((reservation, index) => (
              <Box key={reservation.id}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      {getStatusChip(reservation.status)}
                      {getPaymentChip(reservation.paymentMethod)}
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {reservation.restaurantName}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 3,
                        mt: 1,
                        color: 'text.secondary',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Event fontSize="small" />
                        <Typography variant="body2">{reservation.date}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime fontSize="small" />
                        <Typography variant="body2">{reservation.time}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People fontSize="small" />
                        <Typography variant="body2">
                          {reservation.partySize}名
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight={600} mt={1}>
                      ¥{reservation.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  {reservation.status === 'confirmed' && (
                    <Button variant="outlined" color="error" size="small">
                      キャンセル
                    </Button>
                  )}
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
