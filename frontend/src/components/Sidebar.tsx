import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
} from '@mui/material';
import {
  Search,
  Person,
  Store,
  CalendarMonth,
  AttachMoney,
  Business,
  BarChart,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'temporary';
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  // Customer menu
  { text: '店舗を探す', icon: <Search />, path: '/', roles: ['customer', 'store', 'admin'] },
  { text: 'マイページ', icon: <Person />, path: '/mypage', roles: ['customer'] },

  // Store menu
  { text: '店舗情報管理', icon: <Store />, path: '/store/settings', roles: ['store'] },
  { text: '予約管理', icon: <CalendarMonth />, path: '/store/reservations', roles: ['store'] },
  { text: '売上管理', icon: <AttachMoney />, path: '/store/sales', roles: ['store'] },

  // Admin menu
  { text: '店舗管理', icon: <Business />, path: '/admin/restaurants', roles: ['admin'] },
  { text: '全体売上管理', icon: <BarChart />, path: '/admin/sales', roles: ['admin'] },
];

export function Sidebar({ open, onClose, variant }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto' }}>
      <Toolbar />
      <List>
        {filteredMenuItems.map((item, index) => {
          const isSelected = location.pathname === item.path;

          // Add divider between sections
          const showDivider =
            index > 0 &&
            !item.roles.some((r) =>
              menuItems[index - 1].roles.includes(r)
            );

          return (
            <Box key={item.path}>
              {showDivider && <Divider sx={{ my: 1 }} />}
              <ListItem disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isSelected ? 'white' : 'primary.main',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
