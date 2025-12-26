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
import { TrendingUp, Store, AttachMoney, Event } from '@mui/icons-material';

// Mock total sales data
const MOCK_TOTAL_SUMMARY = {
  totalSales: 5850000,
  totalReservations: 425,
  activeRestaurants: 12,
  averagePerRestaurant: 487500,
};

const MOCK_RESTAURANT_SALES = [
  { name: '和食処 さくら', reservations: 85, sales: 1250000 },
  { name: 'イタリアン ベラビスタ', reservations: 72, sales: 1080000 },
  { name: '焼肉 牛兵衛', reservations: 68, sales: 1020000 },
  { name: 'フレンチ ル・シエル', reservations: 45, sales: 900000 },
  { name: '中華料理 龍門', reservations: 55, sales: 825000 },
];

export function AdminSalesPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        全体売上管理
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
                ¥{MOCK_TOTAL_SUMMARY.totalSales.toLocaleString()}
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
                  総予約件数
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {MOCK_TOTAL_SUMMARY.totalReservations}件
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Store color="success" />
                <Typography variant="body2" color="text.secondary">
                  稼働店舗数
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {MOCK_TOTAL_SUMMARY.activeRestaurants}店舗
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp color="secondary" />
                <Typography variant="body2" color="text.secondary">
                  平均売上/店舗
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                ¥{MOCK_TOTAL_SUMMARY.averagePerRestaurant.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Restaurant Sales Ranking */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            店舗別売上ランキング
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>順位</TableCell>
                <TableCell>店舗名</TableCell>
                <TableCell align="center">予約件数</TableCell>
                <TableCell align="right">売上</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_RESTAURANT_SALES.map((restaurant, index) => (
                <TableRow key={restaurant.name}>
                  <TableCell>
                    <Typography
                      fontWeight={700}
                      color={index < 3 ? 'primary.main' : 'text.primary'}
                    >
                      {index + 1}位
                    </Typography>
                  </TableCell>
                  <TableCell>{restaurant.name}</TableCell>
                  <TableCell align="center">{restaurant.reservations}件</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      ¥{restaurant.sales.toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
