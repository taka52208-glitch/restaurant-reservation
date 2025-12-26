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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TrendingUp, AttachMoney, Event, People } from '@mui/icons-material';

// Mock sales data
const MOCK_SUMMARY = {
  totalSales: 1250000,
  onlineSales: 850000,
  onsiteSales: 400000,
  totalReservations: 85,
  averagePerReservation: 14706,
};

const MOCK_DAILY_SALES = [
  { date: '2025-01-01', reservations: 8, sales: 120000 },
  { date: '2025-01-02', reservations: 12, sales: 180000 },
  { date: '2025-01-03', reservations: 10, sales: 150000 },
  { date: '2025-01-04', reservations: 15, sales: 225000 },
  { date: '2025-01-05', reservations: 18, sales: 270000 },
];

export function StoreSalesPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        売上管理
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney color="primary" />
                <Typography variant="body2" color="text.secondary">
                  総売上
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                ¥{MOCK_SUMMARY.totalSales.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp color="success" />
                <Typography variant="body2" color="text.secondary">
                  事前決済
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                ¥{MOCK_SUMMARY.onlineSales.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Event color="info" />
                <Typography variant="body2" color="text.secondary">
                  予約件数
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {MOCK_SUMMARY.totalReservations}件
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People color="secondary" />
                <Typography variant="body2" color="text.secondary">
                  平均単価
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                ¥{MOCK_SUMMARY.averagePerReservation.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Sales Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            日別売上
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell align="center">予約件数</TableCell>
                <TableCell align="right">売上</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_DAILY_SALES.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{day.date}</TableCell>
                  <TableCell align="center">{day.reservations}件</TableCell>
                  <TableCell align="right">¥{day.sales.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
