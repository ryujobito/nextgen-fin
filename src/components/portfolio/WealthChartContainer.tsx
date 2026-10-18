import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Slider,
  Chip,
  Button,
  ButtonGroup,
  Divider,
  Stack,
  Popover,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Percent,
  Calendar,
  DollarSign,
  Layers,
  Lock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Fund, PortfolioAllocation, PortfolioPreset, YearlyDataPoint, PortfolioAuditSummary } from '../../types';

interface WealthChartContainerProps {
  funds: Fund[];
  allocations: PortfolioAllocation[];
  presets: PortfolioPreset[];
  activePresetId: string | null;
  principal: number;
  annualReturn: number;
  horizon: number;
  trajectory: YearlyDataPoint[];
  auditSummary: PortfolioAuditSummary;
  onSelectPreset: (preset: PortfolioPreset) => void;
  onUpdateAllocation: (fundId: string, weight: number) => void;
  onSetExactAllocation?: (fundId: string, weight: number) => void;
  onToggleFund: (fundId: string) => void;
  onRebalanceEvenly?: () => void;
  onOpenCustomDialog: () => void;
  onUpdatePrincipal: (val: number) => void;
  onUpdateReturn: (val: number) => void;
  onUpdateHorizon: (val: number) => void;
}

export const WealthChartContainer: React.FC<WealthChartContainerProps> = ({
  funds,
  allocations,
  presets,
  activePresetId,
  principal,
  annualReturn,
  horizon,
  trajectory,
  auditSummary,
  onSelectPreset,
  onUpdateAllocation,
  onSetExactAllocation,
  onToggleFund,
  onRebalanceEvenly,
  onOpenCustomDialog,
  onUpdatePrincipal,
  onUpdateReturn,
  onUpdateHorizon,
}) => {
  // ─── Inline Allocation Popover State ───────────────────────────────────────
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [pendingFundId, setPendingFundId] = useState<string | null>(null);
  const [pendingAmount, setPendingAmount] = useState<string>('');
  const [sourceFundId, setSourceFundId] = useState<string>('');

  // Active funds the user can take % from (all active funds excluding the pending one)
  const activeFunds = allocations.filter((a) => a.weight > 0);

  // Total if we confirm: active funds minus deducted % plus new allocation must equal 100
  const pendingAmountNum = parseInt(pendingAmount, 10);
  const isAmountValid = !isNaN(pendingAmountNum) && pendingAmountNum >= 1 && pendingAmountNum <= 99;
  const sourceAlloc = allocations.find((a) => a.fundId === sourceFundId);
  const sourceWeight = sourceAlloc?.weight ?? 0;
  const newSourceWeight = sourceWeight - pendingAmountNum;

  // Validation rules for the popover
  const errorMessage = (() => {
    if (pendingAmount === '') return '';
    if (!isAmountValid) return 'Enter a whole number between 1 and 99.';
    if (!sourceFundId) return 'Select which fund to take from.';
    if (newSourceWeight < 0) return `Not enough — ${sourceFundId} only has ${sourceWeight}% to give.`;
    if (newSourceWeight === 0 && activeFunds.length === 1) return 'Cannot reduce only active fund to 0%.';
    return '';
  })();

  const canConfirm = isAmountValid && sourceFundId !== '' && errorMessage === '';

  // Derived info for display
  const pendingFund = funds.find((f) => f.id === pendingFundId);

  const handleChipClick = (fund: typeof funds[0], event: React.MouseEvent<HTMLElement>) => {
    const alloc = allocations.find((a) => a.fundId === fund.id);
    const isActive = (alloc?.weight ?? 0) > 0;

    if (isActive) {
      // Already active — just toggle off normally via parent handler
      onToggleFund(fund.id);
    } else {
      // Inactive — show the allocation popover
      setPendingFundId(fund.id);
      setPendingAmount('');
      setSourceFundId(activeFunds.length === 1 ? activeFunds[0].fundId : '');
      setPopoverAnchor(event.currentTarget);
    }
  };

  const handlePopoverConfirm = () => {
    if (!pendingFundId || !canConfirm) return;

    const setAlloc = onSetExactAllocation ?? onUpdateAllocation;

    // 1. Deduct from the source fund
    setAlloc(sourceFundId, newSourceWeight);
    // 2. Set the new fund's exact allocation
    setAlloc(pendingFundId, pendingAmountNum);

    setPopoverAnchor(null);
    setPendingFundId(null);
    setPendingAmount('');
    setSourceFundId('');
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPendingFundId(null);
    setPendingAmount('');
    setSourceFundId('');
  };

  // ─── Format currency helpers ───────────────────────────────────────────────
  const formatCompact = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const finalYear = trajectory[trajectory.length - 1] || {
    grossValue: 0,
    netValue: 0,
    cumulativeFees: 0,
  };

  const feeDragPercent = finalYear.grossValue > 0
    ? ((finalYear.cumulativeFees / finalYear.grossValue) * 100).toFixed(1)
    : '0';

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Top Header: Presets & Custom Fund Action */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={22} color="#1976d2" />
              Interactive 30-Year Wealth & Fee Erosion Deconstructor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deconstruct how compounding fees and hidden holding overlaps silently erode your lifetime wealth.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <ButtonGroup size="small" variant="outlined">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant={activePresetId === preset.id ? 'contained' : 'outlined'}
                  onClick={() => onSelectPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </ButtonGroup>

            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<PlusCircle size={16} />}
              onClick={onOpenCustomDialog}
            >
              Add Custom Fund
            </Button>
          </Box>
        </Box>

        {/* Fund Selection Chips & Allocation Badges */}
        <Box sx={{ mb: 2.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>
            ACTIVE PORTFOLIO ALLOCATION (CLICK TO TOGGLE / SLIDE WEIGHTS):
          </Typography>
          <Grid container spacing={1.5} alignItems="center">
            {funds.map((fund) => {
              const alloc = allocations.find((a) => a.fundId === fund.id);
              const isActive = (alloc?.weight || 0) > 0;
              const feePct = (fund.expenseRatio * 100).toFixed(2);

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={fund.id}>
                  <Box
                    sx={{
                      p: 1,
                      border: '1px solid',
                      borderColor: isActive ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      bgcolor: isActive ? 'primary.50' : 'background.paper',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Chip
                        label={fund.ticker}
                        size="small"
                        color={isActive ? 'primary' : 'default'}
                        onClick={(e) => handleChipClick(fund, e)}
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Fee: <strong>{feePct}%</strong>
                      </Typography>
                      <Typography variant="caption" fontWeight="bold" color={isActive ? 'primary.main' : 'text.disabled'}>
                        {alloc?.weight || 0}%
                      </Typography>
                    </Box>

                    {isActive && (
                      <Slider
                        size="small"
                        value={alloc?.weight || 0}
                        min={0}
                        max={100}
                        step={1}
                        onChange={(_, val) => onUpdateAllocation(fund.id, val as number)}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* ─── Inline Allocation Popover ─────────────────────────────────── */}
        <Popover
          open={Boolean(popoverAnchor)}
          anchorEl={popoverAnchor}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: { p: 2.5, width: 320, borderRadius: 2, boxShadow: 6 },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              ➕ Add {pendingFund?.ticker ?? '—'} to Portfolio
            </Typography>
            <Button size="small" color="inherit" onClick={handlePopoverClose} sx={{ minWidth: 0, p: 0.5 }}>
              ✕
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.4 }}>
            Portfolio must total exactly <strong>100%</strong>. Enter how much to allocate to{' '}
            <strong>{pendingFund?.name ?? '—'}</strong>, and choose which active fund gives up that %.
          </Typography>

          {/* Amount Input */}
          <TextField
            label={`Allocate to ${pendingFund?.ticker ?? '—'} (%)`}
            placeholder="e.g. 20"
            type="number"
            size="small"
            fullWidth
            value={pendingAmount}
            onChange={(e) => setPendingAmount(e.target.value)}
            inputProps={{ min: 1, max: 99, step: 1 }}
            sx={{ mb: 2 }}
            error={Boolean(errorMessage)}
          />

          {/* Source Fund Selector */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Take % from which fund?</InputLabel>
            <Select
              value={sourceFundId}
              label="Take % from which fund?"
              onChange={(e) => setSourceFundId(e.target.value)}
            >
              {activeFunds.map((a) => {
                const f = funds.find((x) => x.id === a.fundId);
                return (
                  <MenuItem key={a.fundId} value={a.fundId}>
                    {f?.ticker ?? a.fundId} — currently {a.weight}%
                    {isAmountValid && a.fundId === sourceFundId
                      ? ` → would become ${Math.max(0, a.weight - pendingAmountNum)}%`
                      : ''}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Live Preview of resulting total */}
          {isAmountValid && sourceFundId && !errorMessage && (
            <Alert severity="success" sx={{ mb: 1.5, py: 0.5 }}>
              ✓ Total will be exactly 100%: {pendingFund?.ticker} gets {pendingAmountNum}%,{' '}
              {funds.find((f) => f.id === sourceFundId)?.ticker} drops to {newSourceWeight}%.
            </Alert>
          )}

          {/* Inline Error */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 1.5, py: 0.5 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" color="inherit" variant="outlined" onClick={handlePopoverClose}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={!canConfirm}
              onClick={handlePopoverConfirm}
            >
              Add {pendingFund?.ticker} at {isAmountValid ? `${pendingAmountNum}%` : '—'}
            </Button>
          </Box>
        </Popover>

        {/* Main Recharts Wealth Trajectory Canvas */}
        <Box sx={{ height: { xs: 320, md: 380 }, width: '100%', mt: 1, mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trajectory} margin={{ top: 10, right: 20, left: 15, bottom: 5 }}>
              <defs>
                <linearGradient id="feeLossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="year"
                tickFormatter={(val) => `Yr ${val}`}
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatCompact}
                stroke="#666"
                fontSize={12}
                domain={['auto', 'auto']}
              />
              <RechartsTooltip
                formatter={(value: any, name: string) => {
                  if (typeof value === 'number') {
                    if (name === 'Gross Wealth (0% Fee)') return [`$${value.toLocaleString()}`, name];
                    if (name === 'Realized Net Wealth') return [`$${value.toLocaleString()}`, name];
                    if (name === 'Wealth Lost to Fees') return [`-$${value.toLocaleString()}`, name];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `Investment Horizon: Year ${label}`}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="cumulativeFees"
                name="Wealth Lost to Fees"
                fill="url(#feeLossGradient)"
                stroke="#d32f2f"
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="grossValue"
                name="Gross Wealth (0% Fee)"
                stroke="#2e7d32"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="netValue"
                name="Realized Net Wealth"
                stroke="#1976d2"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

        {/* Metric Callout Strip */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Gross Potential (0% Fee)</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                ${finalYear.grossValue.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Realized Net Wealth</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                ${finalYear.netValue.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'error.light', borderRadius: 1.5, textAlign: 'center', bgcolor: 'error.50' }}>
              <Typography variant="caption" color="error.main" fontWeight="bold">Total Forfeited to Fees</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                -${finalYear.cumulativeFees.toLocaleString()} ({feeDragPercent}%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Holding Overlap Score</Typography>
              <Typography variant="h6" fontWeight="bold" color={auditSummary.totalOverlapScore > 30 ? 'warning.main' : 'text.primary'}>
                {auditSummary.totalOverlapScore}% Duplicate
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Interactive Sliders: Horizon, Expected Return, Capital */}
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ px: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Calendar size={14} /> Time Horizon: <strong>{horizon} Years</strong>
              </Typography>
              <Slider
                value={horizon}
                min={1}
                max={40}
                step={1}
                valueLabelDisplay="auto"
                onChange={(_, val) => onUpdateHorizon(val as number)}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ px: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Percent size={14} /> Expected Annual Return: <strong>{(annualReturn * 100).toFixed(1)}%</strong>
              </Typography>
              <Slider
                value={annualReturn * 100}
                min={3.0}
                max={12.0}
                step={0.5}
                valueLabelDisplay="auto"
                onChange={(_, val) => onUpdateReturn((val as number) / 100)}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ px: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DollarSign size={14} /> Initial Principal: <strong>${principal.toLocaleString()}</strong>
              </Typography>
              <Slider
                value={principal}
                min={5000}
                max={250000}
                step={5000}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `$${(v / 1000).toFixed(0)}k`}
                onChange={(_, val) => onUpdatePrincipal(val as number)}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Overlap Summary Strip */}
        {auditSummary.topOverlaps.length > 0 && (
          <Box sx={{ mt: 2.5, p: 1.5, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.light', borderRadius: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AlertTriangle size={18} color="#ed6c02" />
              <Typography variant="subtitle2" color="warning.dark" fontWeight="bold">
                Hidden Redundant Concentration Detected ({auditSummary.totalOverlapScore}% duplicate exposure)
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              You are paying distinct management fees for multiple funds that hold the same exact mega-cap equities:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {auditSummary.topOverlaps.map((item) => (
                <Chip
                  key={item.ticker}
                  size="small"
                  label={`${item.ticker} (${item.name}): ${item.combinedWeight}% across [${item.presentInFunds.join(', ')}]`}
                  variant="outlined"
                  color="warning"
                />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
