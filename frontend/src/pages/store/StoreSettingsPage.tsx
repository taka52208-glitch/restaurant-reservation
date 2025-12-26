import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add, Edit, Delete } from '@mui/icons-material';

// Mock store data
const MOCK_STORE = {
  name: 'イタリアン ベラビスタ',
  description: '本場イタリアの味を再現した創作イタリアン',
  address: '東京都渋谷区神南1-2-3 渋谷ビル2F',
  phone: '03-1234-5678',
  email: 'info@bellavista.example.com',
  genre: 'イタリアン',
  area: '東京・渋谷',
  openingHours: '17:00-23:00',
  closingDays: '月曜日',
};

const MOCK_SEATS = [
  { id: '1', name: 'テーブル1', capacity: 2 },
  { id: '2', name: 'テーブル2', capacity: 4 },
  { id: '3', name: 'テーブル3', capacity: 4 },
  { id: '4', name: 'カウンター席', capacity: 6 },
  { id: '5', name: '個室A', capacity: 8 },
];

export function StoreSettingsPage() {
  const [store, setStore] = useState(MOCK_STORE);
  const [seats, setSeats] = useState(MOCK_SEATS);
  const [openSeatDialog, setOpenSeatDialog] = useState(false);
  const [editingSeat, setEditingSeat] = useState<{ name: string; capacity: number } | null>(null);

  const handleStoreChange = (field: string, value: string) => {
    setStore((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSeat = () => {
    setEditingSeat({ name: '', capacity: 2 });
    setOpenSeatDialog(true);
  };

  const handleSaveSeat = () => {
    if (editingSeat) {
      setSeats((prev) => [
        ...prev,
        { id: String(Date.now()), ...editingSeat },
      ]);
    }
    setOpenSeatDialog(false);
    setEditingSeat(null);
  };

  const handleDeleteSeat = (id: string) => {
    setSeats((prev) => prev.filter((s) => s.id !== id));
  };

  const totalCapacity = seats.reduce((sum, seat) => sum + seat.capacity, 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        店舗情報管理
      </Typography>

      {/* Store Info */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={3}>
            基本情報
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="店舗名"
                value={store.name}
                onChange={(e) => handleStoreChange('name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="ジャンル"
                value={store.genre}
                onChange={(e) => handleStoreChange('genre', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="説明"
                value={store.description}
                onChange={(e) => handleStoreChange('description', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="住所"
                value={store.address}
                onChange={(e) => handleStoreChange('address', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="エリア"
                value={store.area}
                onChange={(e) => handleStoreChange('area', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="電話番号"
                value={store.phone}
                onChange={(e) => handleStoreChange('phone', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="メールアドレス"
                value={store.email}
                onChange={(e) => handleStoreChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="営業時間"
                value={store.openingHours}
                onChange={(e) => handleStoreChange('openingHours', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="定休日"
                value={store.closingDays}
                onChange={(e) => handleStoreChange('closingDays', e.target.value)}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained">変更を保存</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Seats */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                席・テーブル管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                合計収容人数: {totalCapacity}名
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddSeat}>
              席を追加
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>席名</TableCell>
                <TableCell align="center">収容人数</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seats.map((seat) => (
                <TableRow key={seat.id}>
                  <TableCell>{seat.name}</TableCell>
                  <TableCell align="center">{seat.capacity}名</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSeat(seat.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Seat Dialog */}
      <Dialog open={openSeatDialog} onClose={() => setOpenSeatDialog(false)}>
        <DialogTitle>席を追加</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="席名"
            value={editingSeat?.name || ''}
            onChange={(e) =>
              setEditingSeat((prev) => prev ? { ...prev, name: e.target.value } : null)
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="収容人数"
            type="number"
            value={editingSeat?.capacity || 2}
            onChange={(e) =>
              setEditingSeat((prev) =>
                prev ? { ...prev, capacity: Number(e.target.value) } : null
              )
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSeatDialog(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSaveSeat}>
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
