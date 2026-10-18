import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Slider,
  MenuItem,
  Grid,
} from '@mui/material';
import { Fund } from '../../types';

interface CustomFundDialogProps {
  open: boolean;
  onClose: () => void;
  onAddFund: (newFund: Fund) => void;
}

export const CustomFundDialog: React.FC<CustomFundDialogProps> = ({ open, onClose, onAddFund }) => {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Fund['category']>('Custom');
  const [strategy, setStrategy] = useState<Fund['strategy']>('Active Management');
  const [expenseRatioPct, setExpenseRatioPct] = useState<number>(0.65);
  const [settlementRail, setSettlementRail] = useState<Fund['settlementRail']>('Traditional T+1');
  const [topHoldingsStr, setTopHoldingsStr] = useState('NVDA: 8.5, AAPL: 7.0, MSFT: 6.5, TSLA: 5.0');

  const handleSave = () => {
    if (!ticker.trim() || !name.trim()) return;

    // Parse top holdings string
    const parsedHoldings = topHoldingsStr
      .split(',')
      .map((item) => {
        const [t, w] = item.split(':');
        const cleanTicker = (t || '').trim().toUpperCase();
        const weightVal = parseFloat((w || '').trim()) || 5.0;
        return {
          ticker: cleanTicker,
          name: cleanTicker,
          weight: weightVal,
        };
      })
      .filter((h) => h.ticker.length > 0);

    const newFund: Fund = {
      id: `custom-${ticker.toLowerCase().trim()}-${Date.now()}`,
      ticker: ticker.toUpperCase().trim(),
      name: name.trim(),
      category,
      strategy,
      expenseRatio: expenseRatioPct / 100,
      settlementRail,
      tradingHours: settlementRail === 'Atomic T+0' ? '24/7 Continuous' : 'Market Hours (9:30am - 4:00pm EST)',
      custodyModel: settlementRail === 'Atomic T+0' ? 'Qualified Smart Vault / PoR' : 'Centralized Custodian (DTC/NSCC)',
      protection: settlementRail === 'Atomic T+0' ? 'Cryptographic Proof-of-Reserves' : 'SIPC Insured (up to $500k)',
      description: `Custom defined fund: ${name} with ${expenseRatioPct}% expense ratio.`,
      topHoldings: parsedHoldings.length > 0 ? parsedHoldings : [
        { ticker: 'AAPL', name: 'Apple Inc', weight: 8.0 },
        { ticker: 'MSFT', name: 'Microsoft Corp', weight: 7.5 },
      ],
      isCustom: true,
    };

    onAddFund(newFund);
    onClose();
    // Reset form
    setTicker('');
    setName('');
    setExpenseRatioPct(0.65);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>➕ Create Custom Fund Scenario</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Simulate any real or hypothetical mutual fund, ETF, or tokenized instrument to test how its expense ratio and stock concentration impact long-term compounding.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Ticker Symbol"
              placeholder="e.g. TECH"
              fullWidth
              size="small"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Fund Name"
              placeholder="e.g. Global High Alpha Growth"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Category"
              fullWidth
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value as Fund['category'])}
            >
              <MenuItem value="Broad Market Index">Broad Market Index</MenuItem>
              <MenuItem value="Tech Growth">Tech Growth</MenuItem>
              <MenuItem value="Active Innovation">Active Innovation</MenuItem>
              <MenuItem value="Dividend Value">Dividend Value</MenuItem>
              <MenuItem value="Tokenized RWA">Tokenized RWA</MenuItem>
              <MenuItem value="Custom">Custom Strategy</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Settlement Rail"
              fullWidth
              size="small"
              value={settlementRail}
              onChange={(e) => setSettlementRail(e.target.value as Fund['settlementRail'])}
            >
              <MenuItem value="Traditional T+1">Traditional T+1 (DTCC Broker)</MenuItem>
              <MenuItem value="Atomic T+0">Atomic T+0 (On-Chain DvP)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Annual Expense Ratio: <strong>{expenseRatioPct.toFixed(2)}%</strong>
            </Typography>
            <Slider
              value={expenseRatioPct}
              min={0.01}
              max={2.50}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              onChange={(_, val) => setExpenseRatioPct(val as number)}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Top Holdings (Format: TICKER: WEIGHT%, ...)"
              helperText="Comma separated. Used to calculate overlap against your other funds."
              fullWidth
              size="small"
              value={topHoldingsStr}
              onChange={(e) => setTopHoldingsStr(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!ticker.trim() || !name.trim()}
        >
          Add to Portfolio
        </Button>
      </DialogActions>
    </Dialog>
  );
};
