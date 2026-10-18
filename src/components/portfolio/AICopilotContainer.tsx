import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  IconButton,
  Chip,
  Stack,
  Divider,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { ChatMessage, PortfolioAuditSummary } from '../../types';

interface AICopilotContainerProps {
  messages: ChatMessage[];
  auditSummary: PortfolioAuditSummary;
  onSendMessage: (query: string) => void;
}

export const AICopilotContainer: React.FC<AICopilotContainerProps> = ({
  messages,
  auditSummary,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat stream to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const query = inputText.trim();
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      onSendMessage(query);
      setIsProcessing(false);
    }, 250);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onSendMessage(prompt);
      setIsProcessing(false);
    }, 250);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B':
        return 'primary';
      case 'C':
        return 'warning';
      default:
        return 'error';
    }
  };

  // Get current active prompt suggestions from the last AI message
  const lastAiMessage = [...messages].reverse().find((m) => m.sender === 'ai');
  const activeSuggestions = lastAiMessage?.suggestedPrompts || [
    '💡 Audit My Current Portfolio',
    '🔍 Check Holding Overlaps',
    '⚡ Compare with Tokenized T+0 Rail',
    '🛡️ What are the SIPC vs Smart Contract risks?',
  ];

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header: AI Copilot Status & Real-Time Portfolio Chips */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <Bot size={22} color="#fff" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Nexa AI Fiduciary Copilot & Chat
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Context-aware fiduciary auditor synchronized with the live portfolio chart above.
              </Typography>
            </Box>
          </Box>

          {/* Metric Status Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<CheckCircle size={15} />}
              label={`Efficiency Grade: ${auditSummary.efficiencyGrade}`}
              color={getGradeColor(auditSummary.efficiencyGrade)}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Chip
              icon={<AlertCircle size={15} />}
              label={`Overlap: ${auditSummary.totalOverlapScore}%`}
              color={auditSummary.totalOverlapScore > 30 ? 'warning' : 'default'}
              size="small"
            />
            <Chip
              label={`30-Yr Fee Drag: -$${auditSummary.thirtyYearFeeLoss.toLocaleString()}`}
              color={auditSummary.thirtyYearFeeLoss > 50000 ? 'error' : 'default'}
              size="small"
            />
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Scrollable Chat History Container */}
        <Box
          sx={{
            maxHeight: 360,
            minHeight: 220,
            overflowY: 'auto',
            p: 1.5,
            bgcolor: 'action.hover',
            borderRadius: 2,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              {msg.sender === 'ai' && (
                <Avatar sx={{ bgcolor: 'primary.light', width: 28, height: 28, mt: 0.5 }}>
                  <Bot size={16} color="#fff" />
                </Avatar>
              )}

              <Paper
                elevation={1}
                sx={{
                  p: 1.8,
                  maxWidth: { xs: '88%', sm: '80%' },
                  bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.sender === 'user' ? '#fff' : 'text.primary',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  border: msg.sender === 'ai' ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                    fontSize: '0.9rem',
                    '& strong': {
                      color: msg.sender === 'user' ? '#fff' : 'primary.dark',
                    },
                  }}
                >
                  {msg.content}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    textAlign: 'right',
                    opacity: 0.7,
                    fontSize: '0.7rem',
                  }}
                >
                  {msg.timestamp}
                </Typography>
              </Paper>

              {msg.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 28, height: 28, mt: 0.5 }}>
                  <User size={16} color="#fff" />
                </Avatar>
              )}
            </Box>
          ))}

          {isProcessing && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Nexa Copilot is analyzing portfolio mathematics...
              </Typography>
            </Box>
          )}

          <div ref={chatBottomRef} />
        </Box>

        {/* Quick Action Prompt Chips */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 'medium' }}>
            Quick Suggested Prompts:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {activeSuggestions.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                size="small"
                variant="outlined"
                color="primary"
                clickable
                onClick={() => handlePromptClick(prompt)}
                sx={{ borderRadius: 1.5, py: 0.5 }}
              />
            ))}
          </Stack>
        </Box>

        {/* Message Input & Send Action */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask Nexa Copilot anything about fee drag, overlaps, or T+0 tokenized rails..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing}
            sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <Send size={18} />
          </IconButton>
        </Box>

        {/* Educational Disclaimer Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5, opacity: 0.75 }}>
          <ShieldCheck size={14} color="#666" />
          <Typography variant="caption" color="text.secondary">
            <strong>Fiduciary Guardrail Active:</strong> Operates strictly on deterministic mathematical models and financial deconstruction. No speculative stock tips or predictions.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
