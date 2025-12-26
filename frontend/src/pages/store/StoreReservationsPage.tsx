import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';

const MOCK_RESERVATIONS = [
  {
    id: '1',
    customerName: '山田 太郎',
    date: '2025-01-05',
    time: '18:00',
    partySize: 4,
    status: 'confirmed',
    paymentMethod: 'online',
    amount: 20000,
  },
  {
    id: '2',
    customerName: '佐藤 花子',
    date: '2025-01-05',
    time: '19:00',
    partySize: 2,
    status: 'confirmed',
    paymentMethod: 'onsite',
    amount: 10000,
  },
  {
    id: '3',
    customerName: '田中 一郎',
    date: '2025-01-06',
    time: '12:00',
    partySize: 6,
    status: 'confirmed',
    paymentMethod: 'online',
    amount: 30000,
  },
];

export function StoreReservationsPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredReservations = MOCK_RESERVATIONS.filter((r) => {
    if (selectedDate && r.date !== selectedDate) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        予約管理
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="日付で絞り込み"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={statusFilter}
                  label="ステータス"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="confirmed">予約確定</MenuItem>
                  <MenuItem value="completed">来店済み</MenuItem>
                  <MenuItem value="cancelled">キャンセル</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedDate('');
                  setStatusFilter('all');
                }}
              >
                フィルターをクリア
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            予約一覧 ({filteredReservations.length}件)
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell>時間</TableCell>
                <TableCell>お客様名</TableCell>
                <TableCell align="center">人数</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>決済方法</TableCell>
                <TableCell align="right">金額</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.date}</TableCell>
                  <TableCell>{reservation.time}</TableCell>
                  <TableCell>{reservation.customerName}</TableCell>
                  <TableCell align="center">{reservation.partySize}名</TableCell>
                  <TableCell>{getStatusChip(reservation.status)}</TableCell>
                  <TableCell>
                    {reservation.paymentMethod === 'online' ? '事前決済' : '現地払い'}
                  </TableCell>
                  <TableCell align="right">
                    ¥{reservation.amount.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined">
                      来店確認
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredReservations.length === 0 && (
            <Box textAlign="center" py={4} color="text.secondary">
              <Typography>該当する予約がありません</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
