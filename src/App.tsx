import React, { useState, useMemo } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
} from '@mui/material';
import { SEED_FUNDS, PORTFOLIO_PRESETS } from './data/seedFunds';
import { Fund, PortfolioAllocation, PortfolioPreset, ChatMessage } from './types';
import { calculateGrowthTrajectory, calculateAuditSummary } from './services/portfolioMath';
import { getInitialGreetingMessage, processUserQuery } from './services/aiCopilot';
import { TopNavigation } from './components/layout/TopNavigation';
import { FooterDisclaimer } from './components/layout/FooterDisclaimer';
import { AboutDocsDialog } from './components/layout/AboutDocsDialog';
import { WealthChartContainer } from './components/portfolio/WealthChartContainer';
import { AICopilotContainer } from './components/portfolio/AICopilotContainer';
import { CustomFundDialog } from './components/portfolio/CustomFundDialog';
import { DualRailSettleRace } from './components/settle/DualRailSettleRace';
import { TokenLifecycleSandbox } from './components/lifecycle/TokenLifecycleSandbox';

// Using standard Material UI Default Theme as requested
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<number>(0);

  // Fund Catalog & Custom Fund State
  const [funds, setFunds] = useState<Fund[]>(SEED_FUNDS);
  const [customDialogOpen, setCustomDialogOpen] = useState<boolean>(false);
  const [docsDialogOpen, setDocsDialogOpen] = useState<boolean>(false);

  // Active Portfolio State (Default: "The Retail Tech Trap")
  const defaultPreset = PORTFOLIO_PRESETS[0];
  const [activePresetId, setActivePresetId] = useState<string | null>(defaultPreset.id);
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>(defaultPreset.allocations);

  // Global Simulation Parameters
  const [principal, setPrincipal] = useState<number>(50000);
  const [annualReturn, setAnnualReturn] = useState<number>(0.07);
  const [horizon, setHorizon] = useState<number>(30);

  // AI Copilot Chat State (Clean initial welcome message)
  const [messages, setMessages] = useState<ChatMessage[]>([getInitialGreetingMessage()]);

  // Reactive Financial Calculations
  const auditSummary = useMemo(() => {
    return calculateAuditSummary(allocations, funds, principal, annualReturn, horizon);
  }, [allocations, funds, principal, annualReturn, horizon]);

  const trajectory = useMemo(() => {
    return calculateGrowthTrajectory(principal, annualReturn, auditSummary.weightedExpenseRatio, horizon);
  }, [principal, annualReturn, auditSummary.weightedExpenseRatio, horizon]);

  // Handlers
  const handleSelectPreset = (preset: PortfolioPreset) => {
    setActivePresetId(preset.id);
    setAllocations(preset.allocations);
  };

  const handleUpdateAllocation = (fundId: string, weight: number) => {
    setActivePresetId(null); // Custom allocation mode
    setAllocations((prev) => {
      const exists = prev.find((a) => a.fundId === fundId);
      if (exists) {
        return prev.map((a) => (a.fundId === fundId ? { ...a, weight } : a));
      }
      return [...prev, { fundId, weight }];
    });
  };

  const handleToggleFund = (fundId: string) => {
    setActivePresetId(null);
    setAllocations((prev) => {
      const existing = prev.find((a) => a.fundId === fundId);
      if (existing && existing.weight > 0) {
        return prev.map((a) => (a.fundId === fundId ? { ...a, weight: 0 } : a));
      } else if (existing) {
        return prev.map((a) => (a.fundId === fundId ? { ...a, weight: 25 } : a));
      }
      return [...prev, { fundId, weight: 25 }];
    });
  };

  const handleAddCustomFund = (newFund: Fund) => {
    setFunds((prev) => [newFund, ...prev]);
    setActivePresetId(null);
    setAllocations((prev) => [{ fundId: newFund.id, weight: 20 }, ...prev]);
  };

  const handleSendMessage = (query: string) => {
    // Add user message to stream
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    // Generate fiduciary response
    const aiResponse = processUserQuery(query, auditSummary, allocations, funds, principal, horizon);

    setMessages((prev) => [...prev, userMsg, aiResponse]);
  };

  const handleResetAll = () => {
    setFunds(SEED_FUNDS);
    setActivePresetId(defaultPreset.id);
    setAllocations(defaultPreset.allocations);
    setPrincipal(50000);
    setAnnualReturn(0.07);
    setHorizon(30);
    setMessages([getInitialGreetingMessage()]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Top Sticky Navigation */}
        <TopNavigation
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onResetAll={handleResetAll}
          onOpenDocs={() => setDocsDialogOpen(true)}
        />

        {/* Main Content Area */}
        <Container maxWidth="xl" sx={{ mt: 3, flexGrow: 1 }}>
          {/* TAB 0: Smart Portfolio Workspace (Stacked Layout: Chart on Top, AI Chat on Bottom) */}
          {currentTab === 0 && (
            <Box>
              <WealthChartContainer
                funds={funds}
                allocations={allocations}
                presets={PORTFOLIO_PRESETS}
                activePresetId={activePresetId}
                principal={principal}
                annualReturn={annualReturn}
                horizon={horizon}
                trajectory={trajectory}
                auditSummary={auditSummary}
                onSelectPreset={handleSelectPreset}
                onUpdateAllocation={handleUpdateAllocation}
                onToggleFund={handleToggleFund}
                onOpenCustomDialog={() => setCustomDialogOpen(true)}
                onUpdatePrincipal={setPrincipal}
                onUpdateReturn={setAnnualReturn}
                onUpdateHorizon={setHorizon}
              />

              <AICopilotContainer
                messages={messages}
                auditSummary={auditSummary}
                onSendMessage={handleSendMessage}
              />
            </Box>
          )}

          {/* TAB 1: Dual-Rail Settlement Race (T+1 vs T+0) */}
          {currentTab === 1 && <DualRailSettleRace />}

          {/* TAB 2: Tokenized Asset Lifecycle Sandbox (MUI Stepper) */}
          {currentTab === 2 && <TokenLifecycleSandbox />}
        </Container>

        {/* Modals & Dialogs */}
        <CustomFundDialog
          open={customDialogOpen}
          onClose={() => setCustomDialogOpen(false)}
          onAddFund={handleAddCustomFund}
        />

        <AboutDocsDialog
          open={docsDialogOpen}
          onClose={() => setDocsDialogOpen(false)}
        />

        {/* Footer Disclaimers */}
        <FooterDisclaimer />
      </Box>
    </ThemeProvider>
  );
};

export default App;
