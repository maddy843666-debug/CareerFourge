import React from 'react';
import { VoiceInterview } from './VoiceInterview';
import { ChatInterview } from './ChatInterview';

export interface ChatMessage {
  sender: 'AI HR Interviewer' | 'You';
  text: string;
  time: string;
  verdict?: 'correct' | 'partially_correct' | 'incorrect';
  verdict_explanation?: string;
  evaluation?: any;
  feedback?: string;
  audioText?: string;
}

export interface AdaptiveInterviewProps {
  onProceedToCoding?: () => void;
  onNavigate?: (tab: string, targetId?: string) => void;
  initialMode?: 'voice' | 'chat';
}

export const AdaptiveInterview: React.FC<AdaptiveInterviewProps> = ({
  onProceedToCoding,
  onNavigate,
  initialMode = 'voice'
}) => {
  if (initialMode === 'chat') {
    return <ChatInterview onProceedToCoding={onProceedToCoding} onNavigate={onNavigate} />;
  }
  return <VoiceInterview onProceedToCoding={onProceedToCoding} onNavigate={onNavigate} />;
};

export default AdaptiveInterview;
