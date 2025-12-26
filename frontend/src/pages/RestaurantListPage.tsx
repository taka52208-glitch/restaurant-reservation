import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Search, LocationOn, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for restaurants
const MOCK_RESTAURANTS = [
  {
    id: '1',
    name: '和食処 さくら',
    description: '季節の食材を使った本格和食をお楽しみいただけます',
    genre: '和食',
    area: '東京・銀座',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    openingHours: '11:00-22:00',
  },
  {
    id: '2',
    name: 'イタリアン ベラビスタ',
    description: '本場イタリアの味を再現した創作イタリアン',
    genre: 'イタリアン',
    area: '東京・渋谷',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    openingHours: '17:00-23:00',
  },
  {
    id: '3',
    name: '焼肉 牛兵衛',
    description: '厳選された黒毛和牛を炭火で焼き上げます',
    genre: '焼肉',
    area: '東京・新宿',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    openingHours: '17:00-24:00',
  },
  {
    id: '4',
    name: 'フレンチ ル・シエル',
    description: '洗練されたフランス料理とワインのマリアージュ',
    genre: 'フレンチ',
    area: '東京・表参道',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400',
    openingHours: '11:30-14:00, 18:00-22:00',
  },
];

const AREAS = ['すべて', '東京・銀座', '東京・渋谷', '東京・新宿', '東京・表参道'];
const GENRES = ['すべて', '和食', 'イタリアン', 'フレンチ', '焼肉', '中華'];

export function RestaurantListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('すべて');
  const [selectedGenre, setSelectedGenre] = useState('すべて');

  const filteredRestaurants = MOCK_RESTAURANTS.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea =
      selectedArea === 'すべて' || restaurant.area === selectedArea;
    const matchesGenre =
      selectedGenre === 'すべて' || restaurant.genre === selectedGenre;
    return matchesSearch && matchesArea && matchesGenre;
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        店舗を探す
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="店舗名やキーワードで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>エリア</InputLabel>
              <Select
                value={selectedArea}
                label="エリア"
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                {AREAS.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>ジャンル</InputLabel>
              <Select
                value={selectedGenre}
                label="ジャンル"
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {GENRES.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Restaurant List */}
      <Grid container spacing={3}>
        {filteredRestaurants.map((restaurant) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={restaurant.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={restaurant.imageUrl}
                alt={restaurant.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    label={restaurant.genre}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {restaurant.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {restaurant.description}
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.area}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.openingHours}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                >
                  詳細・予約
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredRestaurants.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6">該当する店舗が見つかりませんでした</Typography>
          <Typography variant="body2">検索条件を変更してお試しください</Typography>
        </Box>
      )}
    </Box>
  );
}
