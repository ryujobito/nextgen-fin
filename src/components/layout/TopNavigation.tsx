import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Zap,
  Coins,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface TopNavigationProps {
  currentTab: number;
  onTabChange: (newTab: number) => void;
  onResetAll: () => void;
  onOpenDocs: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onTabChange,
  onResetAll,
  onOpenDocs,
}) => {
  return (
    <AppBar position="sticky" elevation={1} color="default" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        {/* Brand & Tagline */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: '#fff',
            }}
          >
            <TrendingUp size={22} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                NexaFund
              </Typography>
              <Chip label="Technica Prototype" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Dual-Rail ETF & Tokenized Asset Simulator
            </Typography>
          </Box>
        </Box>

        {/* 3 Main Navigation Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_, val) => onTabChange(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ minHeight: 48 }}
        >
          <Tab
            icon={<TrendingUp size={16} />}
            iconPosition="start"
            label="Portfolio & AI Copilot"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          />
          <Tab
            icon={<Zap size={16} />}
            iconPosition="start"
            label="Dual-Rail Settle Race"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          />
          <Tab
            icon={<Coins size={16} />}
            iconPosition="start"
            label="Token Lifecycle Sandbox"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          />
        </Tabs>

        {/* Global Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<BookOpen size={16} />}
            onClick={onOpenDocs}
          >
            Docs
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RotateCcw size={16} />}
            onClick={onResetAll}
          >
            Reset
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
