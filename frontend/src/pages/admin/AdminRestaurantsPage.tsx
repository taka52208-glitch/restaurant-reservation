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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const MOCK_RESTAURANTS = [
  {
    id: '1',
    name: '和食処 さくら',
    owner: '田中 次郎',
    area: '東京・銀座',
    status: 'active',
    createdAt: '2024-10-15',
  },
  {
    id: '2',
    name: 'イタリアン ベラビスタ',
    owner: '鈴木 花子',
    area: '東京・渋谷',
    status: 'active',
    createdAt: '2024-11-20',
  },
  {
    id: '3',
    name: '新規レストラン',
    owner: '山田 太郎',
    area: '東京・新宿',
    status: 'pending',
    createdAt: '2024-12-25',
  },
];

export function AdminRestaurantsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof MOCK_RESTAURANTS[0] | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip label="稼働中" color="success" size="small" />;
      case 'pending':
        return <Chip label="承認待ち" color="warning" size="small" />;
      case 'inactive':
        return <Chip label="停止中" color="error" size="small" />;
      default:
        return null;
    }
  };

  const filteredRestaurants = MOCK_RESTAURANTS.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = () => {
    setOpenDialog(false);
    // API call would go here
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        店舗管理
      </Typography>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight={700}>
              {MOCK_RESTAURANTS.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              総店舗数
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {MOCK_RESTAURANTS.filter((r) => r.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              稼働中
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight={700}>
              {MOCK_RESTAURANTS.filter((r) => r.status === 'pending').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              承認待ち
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>ステータス</InputLabel>
          <Select
            value={statusFilter}
            label="ステータス"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">すべて</MenuItem>
            <MenuItem value="active">稼働中</MenuItem>
            <MenuItem value="pending">承認待ち</MenuItem>
            <MenuItem value="inactive">停止中</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Restaurants Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>店舗名</TableCell>
                <TableCell>オーナー</TableCell>
                <TableCell>エリア</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRestaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>{restaurant.name}</TableCell>
                  <TableCell>{restaurant.owner}</TableCell>
                  <TableCell>{restaurant.area}</TableCell>
                  <TableCell>{getStatusChip(restaurant.status)}</TableCell>
                  <TableCell>{restaurant.createdAt}</TableCell>
                  <TableCell align="center">
                    {restaurant.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setOpenDialog(true);
                        }}
                      >
                        承認
                      </Button>
                    )}
                    {restaurant.status === 'active' && (
                      <Button size="small" variant="outlined" color="error">
                        停止
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>店舗承認</DialogTitle>
        <DialogContent>
          <Typography>
            「{selectedRestaurant?.name}」を承認しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            承認すると、この店舗は予約を受け付けられるようになります。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleApprove}>
            承認する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
