import React from 'react';
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
  Tooltip,
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
  onToggleFund: (fundId: string) => void;
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
  onToggleFund,
  onOpenCustomDialog,
  onUpdatePrincipal,
  onUpdateReturn,
  onUpdateHorizon,
}) => {
  // Format currency helpers
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
                        onClick={() => onToggleFund(fund.id)}
                        sx={{ fontWeight: 'bold' }}
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
                        step={5}
                        onChange={(_, val) => onUpdateAllocation(fund.id, val as number)}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

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
