import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Zap,
  Clock,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export const DualRailSettleRace: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [traditionalProgress, setTraditionalProgress] = useState(0);
  const [tokenizedProgress, setTokenizedProgress] = useState(0);
  const [raceStep, setRaceStep] = useState<string>('idle');

  const startRace = () => {
    setIsRunning(true);
    setTraditionalProgress(0);
    setTokenizedProgress(0);
    setRaceStep('initiated');

    // Tokenized Rail: Instant atomic settlement completes in 1.8 seconds
    const tokenInterval = setInterval(() => {
      setTokenizedProgress((prev) => {
        if (prev >= 100) {
          clearInterval(tokenInterval);
          return 100;
        }
        return prev + 25;
      });
    }, 400);

    // Traditional Rail: Simulates 24-48 hour NSCC clearing cycle slowly
    const tradInterval = setInterval(() => {
      setTraditionalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(tradInterval);
          setIsRunning(false);
          setRaceStep('completed');
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  const resetRace = () => {
    setIsRunning(false);
    setTraditionalProgress(0);
    setTokenizedProgress(0);
    setRaceStep('idle');
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Race Control Banner */}
      <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Zap size={22} color="#1976d2" />
                The Dual-Rail Settlement Race: T+1 vs. Atomic T+0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simulate a simultaneous $50,000 portfolio rebalance across traditional Wall Street broker rails vs. modern tokenized RWA rails.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Play size={18} />}
                onClick={startRace}
                disabled={isRunning}
              >
                {raceStep === 'idle' ? 'Run Simultaneous Settle Race' : 'Re-Run Race'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RotateCcw size={18} />}
                onClick={resetRace}
                disabled={isRunning}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Split-Screen Race Lanes */}
          <Grid container spacing={3}>
            {/* Lane 1: Traditional Rail */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  height: '100%',
                  borderLeft: '5px solid #ff9800',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Building2 size={20} color="#ff9800" />
                    Traditional Rail (e.g. SPY / VOO)
                  </Typography>
                  <Chip
                    size="small"
                    label={traditionalProgress === 100 ? 'Settled (T+1 Cleared)' : isRunning ? 'Pending NSCC Batch' : 'T+1 Cycle'}
                    color={traditionalProgress === 100 ? 'success' : 'warning'}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Clearing via <strong>DTCC / NSCC Continuous Net Settlement</strong>. Subject to market hours (9:30 AM–4:00 PM EST).
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="bold">Clearing Progress:</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {traditionalProgress === 100 ? '24 Hours Elapsed (Next Day 4:00 PM)' : `${Math.round(traditionalProgress * 0.24)} Hours Elapsed`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={traditionalProgress}
                    color="warning"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    • <strong>Hour 0:</strong> Broker receives order during market hours.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • <strong>Hour 2:</strong> Order submitted to NSCC end-of-day netting batch.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • <strong>Hour 24:</strong> Cash and shares exchange hands. Broker margin buffers required.
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldCheck size={18} color="#2e7d32" />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Protection:</strong> Backed by federal SIPC insurance up to $500,000 against broker insolvency.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Lane 2: Tokenized RWA Rail */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  height: '100%',
                  borderLeft: '5px solid #2e7d32',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cpu size={20} color="#2e7d32" />
                    Tokenized RWA Rail (e.g. BUIDL / USDY)
                  </Typography>
                  <Chip
                    size="small"
                    label={tokenizedProgress === 100 ? 'Atomic DvP Finality' : isRunning ? 'Confirming Block...' : 'T+0 Instant'}
                    color={tokenizedProgress === 100 ? 'success' : 'primary'}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Clearing via <strong>Permissioned ERC-3643 Smart Contract</strong> on Ethereum / Arbitrum. Continuous 24/7/365.
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="bold">Settlement Velocity:</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tokenizedProgress === 100 ? '12 Seconds (Final Block Confirmation)' : `${Math.round(tokenizedProgress * 0.12)} Seconds Elapsed`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={tokenizedProgress}
                    color="success"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    • <strong>Second 0:</strong> Investor signs atomic Delivery-vs-Payment (DvP) transaction.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • <strong>Second 4:</strong> Identity oracle checks KYC whitelist on-chain.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • <strong>Second 12:</strong> Tokens minted/swapped against USDC instantly with zero counterparty risk.
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertTriangle size={18} color="#ed6c02" />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Trust Model:</strong> Verified via Chainlink Proof-of-Reserves. No automatic SIPC protection in self-custody.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Structural Comparison Matrix Table */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Comprehensive Infrastructure & Risk Comparison
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell><strong>Operational Feature</strong></TableCell>
                  <TableCell><strong>Traditional Broker Rail (T+1)</strong></TableCell>
                  <TableCell><strong>Tokenized RWA Rail (Atomic T+0)</strong></TableCell>
                  <TableCell><strong>Investor Takeaway</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Settlement Latency</strong></TableCell>
                  <TableCell>T+1 Business Days (24 - 48 Hours)</TableCell>
                  <TableCell><Chip label="< 15 Seconds (T+0)" size="small" color="success" /></TableCell>
                  <TableCell>Eliminates settlement lockup and capital drag.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Trading Hours</strong></TableCell>
                  <TableCell>9:30 AM – 4:00 PM EST (Mon - Fri)</TableCell>
                  <TableCell><Chip label="24/7/365 Continuous" size="small" color="primary" /></TableCell>
                  <TableCell>Allows rebalancing and liquidity on weekends/nights.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Custody & Clearing</strong></TableCell>
                  <TableCell>DTCC / NSCC Centralized Clearinghouse</TableCell>
                  <TableCell>Qualified Smart Vault + On-Chain Proof-of-Reserves</TableCell>
                  <TableCell>Code auditability vs. institutional clearing.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Safety Net & Recourse</strong></TableCell>
                  <TableCell><Chip label="SIPC Protected ($500,000)" size="small" color="success" /></TableCell>
                  <TableCell>Cryptographic Reserves + Legal Trust Indenture</TableCell>
                  <TableCell>Traditional finance offers statutory insurance.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Counterparty Failure Risk</strong></TableCell>
                  <TableCell>Broker bankruptcy requires SIPC claim process</TableCell>
                  <TableCell>Atomic DvP: Zero settlement counterparty risk</TableCell>
                  <TableCell>Assets never sit in unconfirmed transit.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
