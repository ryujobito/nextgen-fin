import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Coins,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Code2,
  FileText,
  UserCheck,
  Building,
} from 'lucide-react';
import { LifecycleStep } from '../../types';

const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    step: 0,
    title: 'KYC & Whitelist Verification',
    subtitle: 'ERC-3643 Permissioned Identity Check',
    actor: 'Compliance Oracle',
    status: 'completed',
    solidityCode: `// ERC-3643 Compliance Identity Registry
function isVerified(address investor) public view returns (bool) {
    require(identityRegistry.contains(investor), "KYC: Unregistered");
    require(identityRegistry.isCountryAllowed(investor), "Sanctioned Jurisdiction");
    return true;
}`,
    explanation: 'Unlike anonymous crypto tokens, institutional tokenized securities (RWAs) enforce regulatory compliance on-chain. Investors must link their cryptographic wallet to a verified KYC credential before holding or trading fund shares.',
    traditionalEquivalent: 'Opening an institutional brokerage account, submitting tax forms (W-9 / W-8BEN), and waiting 2–5 business days for compliance review.',
  },
  {
    step: 1,
    title: 'Deposit Collateral & Mint Fund Tokens',
    subtitle: 'Proof-of-Reserves Backing & Issuance',
    actor: 'Smart Contract',
    status: 'in_progress',
    solidityCode: `// Tokenized Fund Vault Issuance
function mintFundTokens(address to, uint256 usdcAmount) external onlyWhitelisted {
    // 1. Verify off-chain Treasury collateral via Chainlink PoR
    require(chainlinkPoR.getLatestReserves() >= totalSupply() + usdcAmount, "Reserve Deficit");
    // 2. Transfer cash collateral to qualified custodian
    usdc.transferFrom(msg.sender, qualifiedCustodianVault, usdcAmount);
    // 3. Mint equivalent tokenized shares at NAV
    _mint(to, usdcAmount / currentNAV);
}`,
    explanation: 'The investor deposits stablecoins or fiat. An automated Chainlink Proof-of-Reserves oracle verifies that physical U.S. Treasury bills exist in the custodian vault before the smart contract mints new tokenized shares at exact Net Asset Value (NAV).',
    traditionalEquivalent: 'Authorizing an Automated Clearing House (ACH) or Fedwire transfer to a mutual fund transfer agent, taking 24 hours to record on a private ledger.',
  },
  {
    step: 2,
    title: 'Atomic Secondary Transfer (DvP)',
    subtitle: 'T+0 Delivery-vs-Payment Finality',
    actor: 'Investor',
    status: 'pending',
    solidityCode: `// Atomic Peer-to-Peer Settlement
function atomicTransfer(address buyer, address seller, uint256 tokenAmount, uint256 price) external {
    require(identityRegistry.isVerified(buyer) && identityRegistry.isVerified(seller), "KYC Required");
    // Simultaneous atomic swap: Tokens and Cash clear in same block
    _transfer(seller, buyer, tokenAmount);
    usdc.transferFrom(buyer, seller, price);
}`,
    explanation: 'Two whitelisted investors trade fund shares directly 24/7. Delivery-vs-Payment (DvP) ensures that the shares and payment swap in the exact same blockchain transaction. Settlement failure is mathematically impossible.',
    traditionalEquivalent: 'Broker submits trade to DTCC / NSCC Continuous Net Settlement. Capital is locked for T+1 business days, requiring capital buffers against default.',
  },
  {
    step: 3,
    title: 'Redemption for Underlying Collateral',
    subtitle: 'Burn Tokens & Wire Fiat/Stablecoin',
    actor: 'Custodian',
    status: 'pending',
    solidityCode: `// Share Redemption & Collateral Release
function redeemTokens(uint256 tokenAmount) external onlyWhitelisted {
    uint256 redemptionValue = tokenAmount * currentNAV;
    // 1. Burn the tokenized fund shares permanently
    _burn(msg.sender, tokenAmount);
    // 2. Release collateral from qualified custodian to investor
    usdc.transfer(msg.sender, redemptionValue);
}`,
    explanation: 'When the investor wishes to exit, they call the redemption smart contract. The fund tokens are permanently burned from circulating supply, and equivalent collateral (cash/USDC) is unlocked from the institutional custodian directly to the investor.',
    traditionalEquivalent: 'Submitting a mutual fund liquidation request prior to 4:00 PM cutoff, waiting for end-of-day NAV strike, and receiving funds via wire 1–2 days later.',
  },
];

export const TokenLifecycleSandbox: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [executionState, setExecutionState] = useState<'idle' | 'simulating' | 'success'>('idle');

  const currentStepData = LIFECYCLE_STEPS[activeStep];

  const handleNext = () => {
    if (activeStep < LIFECYCLE_STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
      setExecutionState('idle');
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setExecutionState('idle');
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setExecutionState('idle');
  };

  const handleSimulateAction = () => {
    setExecutionState('simulating');
    setTimeout(() => {
      setExecutionState('success');
    }, 600);
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Coins size={22} color="#1976d2" />
            Interactive Tokenized Fund Lifecycle Sandbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Step through how Real-World Asset (RWA) funds are issued, verified, traded, and redeemed via permissioned smart contracts.
          </Typography>
        </Box>

        {/* MUI Stepper Header */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {LIFECYCLE_STEPS.map((s, index) => (
            <Step key={s.title}>
              <StepLabel>
                <Typography variant="caption" fontWeight={activeStep === index ? 'bold' : 'normal'}>
                  {s.title}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Detail Content */}
        <Grid container spacing={3}>
          {/* Left Column: Functional Narrative & Real-World Contrast */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Stage {activeStep + 1}: {currentStepData.title}
                </Typography>
                <Chip
                  label={`Actor: ${currentStepData.actor}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2 }}>
                {currentStepData.subtitle}
              </Typography>

              <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 2 }}>
                {currentStepData.explanation}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Building size={14} /> Traditional Wall Street Equivalent:
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentStepData.traditionalEquivalent}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color={executionState === 'success' ? 'success' : 'primary'}
                  startIcon={executionState === 'success' ? <CheckCircle size={18} /> : undefined}
                  onClick={handleSimulateAction}
                  disabled={executionState === 'simulating'}
                >
                  {executionState === 'simulating'
                    ? 'Executing Contract Call...'
                    : executionState === 'success'
                    ? 'Action Verified On-Chain!'
                    : `Simulate Stage ${activeStep + 1} Action`}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowLeft size={16} />}
                >
                  Back
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleNext}
                  disabled={activeStep === LIFECYCLE_STEPS.length - 1}
                  endIcon={<ArrowRight size={16} />}
                >
                  Next Stage
                </Button>

                <Button
                  variant="text"
                  color="inherit"
                  onClick={handleReset}
                  startIcon={<RotateCcw size={16} />}
                >
                  Reset
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Code Snippet & State Inspector */}
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
                bgcolor: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 1, borderBottom: '1px solid #333' }}>
                <Typography variant="caption" sx={{ color: '#9cdcfe', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Code2 size={14} /> SmartContractExecution.sol
                </Typography>
                <Chip label="Solidity 0.8.24" size="small" sx={{ bgcolor: '#333', color: '#fff', fontSize: '0.65rem' }} />
              </Box>

              <Box
                component="pre"
                sx={{
                  flexGrow: 1,
                  m: 0,
                  p: 1.5,
                  overflowX: 'auto',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  color: '#4ec9b0',
                }}
              >
                {currentStepData.solidityCode}
              </Box>

              <Box sx={{ mt: 2, p: 1.2, bgcolor: '#252526', borderRadius: 1, border: '1px solid #333' }}>
                <Typography variant="caption" sx={{ color: '#ce9178', display: 'block' }}>
                  <strong>State Inspector:</strong> [Step {activeStep + 1} Status: {executionState === 'success' ? 'TRANSACTION CONFIRMED #198234' : 'Awaiting Invocation'}]
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
