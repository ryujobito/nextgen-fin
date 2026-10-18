import React from 'react';
import { Box, Typography, Container, Divider, Link } from '@mui/material';
import { ShieldAlert } from 'lucide-react';

export const FooterDisclaimer: React.FC = () => {
  return (
    <Box component="footer" sx={{ py: 3, mt: 5, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <ShieldAlert size={18} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            <strong>Fiduciary & Regulatory Disclosure:</strong> NexaFund is an educational and technical prototype created for the Technica Hackathon. All calculations, compounding projections, fee erosion estimates, and tokenized settlement simulations are based on deterministic mathematical models and historical index fee structures. This tool does not constitute investment, financial, legal, or tax advice, and no fiduciary relationship is formed. Past performance does not guarantee future results.
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Built with React, TypeScript, Material UI, and Recharts.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Technica Hackathon Project — Financial Solutions Track
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
