import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { BookOpen } from 'lucide-react';

interface AboutDocsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AboutDocsDialog: React.FC<AboutDocsDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BookOpen size={22} color="#1976d2" />
        About NexaFund | Dual-Rail Financial Solution
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          1. The Financial Problem: Fee Drag & Overlap Mirage
        </Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          Many investors purchase multiple ETFs believing they achieve diversification. In reality, large-cap index and tech funds share 30%–50% identical top holdings (Apple, Microsoft, Nvidia, Amazon). Investors end up paying multiple overlapping management expense ratios that silently erode 20%–40% of their gross wealth over a 30-year investing horizon.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          2. The Technology Solution: Dual-Rail Traditional vs. Tokenized RWAs
        </Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          Wall Street is migrating toward tokenized real-world assets (RWAs). NexaFund simulates the operational mechanics of both rails:
        </Typography>
        <Box component="ul" sx={{ pl: 2.5, m: 0, color: 'text.secondary', fontSize: '0.875rem' }}>
          <li><strong>Traditional Rail:</strong> T+1 settlement via DTCC clearinghouse, broker custody, SIPC insurance (up to $500k), 9:30 AM–4:00 PM EST trading.</li>
          <li><strong>Tokenized RWA Rail:</strong> T+0 instant atomic settlement, ERC-3643 KYC whitelisting, 24/7/365 liquidity, Chainlink Proof-of-Reserves oracles.</li>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          3. The AI Layer: Unbiased Fiduciary Copilot
        </Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          NexaFund's AI operates on deterministic mathematical models rather than speculative price forecasting. It inspects your chosen portfolio allocations, computes exact dollar fee drag, flags redundant stock concentration, and translates complex tokenization protocols into clear educational insights.
        </Typography>

        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Technica Hackathon Prototype:</strong> Designed to educate investors, finance students, and engineers on portfolio construction, fee efficiency, and institutional blockchain rails.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
