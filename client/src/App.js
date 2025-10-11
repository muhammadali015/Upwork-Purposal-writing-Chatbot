import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Copy, CheckCircle, AlertCircle, Loader, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import './App.css';

function App() {
  const [projectDescription, setProjectDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [templateType, setTemplateType] = useState('default'); // 'default' or 'custom'
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '👋 Hi! I\'m your Upwork Proposal Assistant. Choose your template type and paste any project description to generate professional proposals!',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateProposals = async () => {
    if (!projectDescription.trim()) {
      setError('Please enter a project description');
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: projectDescription.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: '🤖 Analyzing your project description and generating professional proposals...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-proposals', {
        projectDescription: projectDescription.trim(),
        templateType: templateType
      });

      if (response.data.success) {
        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));

        // Add each proposal as a separate bot message
        response.data.proposals.forEach((proposal, index) => {
          const proposalMessage = {
            id: Date.now() + index + 2,
            type: 'bot',
            content: `**${proposal.title}**\n\n${proposal.content}`,
            timestamp: new Date(),
            isProposal: true,
            proposalData: proposal
          };
          setMessages(prev => [...prev, proposalMessage]);
        });
      } else {
        setError('Failed to generate proposals');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Failed to generate proposals. Please check your API key.');

      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessage.id);
        const errorMessage = {
          id: Date.now() + 2,
          type: 'bot',
          content: '❌ Sorry, I encountered an error while generating proposals. Please try again.',
          timestamp: new Date()
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(messageId);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      generateProposals();
    }
  };

  return (
    <div className="app">
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-content">
            <div className="bot-avatar">
              <Bot className="bot-icon" />
            </div>
            <div className="header-info">
              <h1 className="chatbot-title">Upwork Proposal Assistant</h1>
              <p className="chatbot-subtitle">AI-Powered Professional Proposal Generator</p>
            </div>
            <div className="header-status">
              <div className="status-indicator online"></div>
              <span>Online</span>
            </div>
          </div>
        </div>

               {/* Chat Messages */}
               <div className="chat-messages">
                 {messages.map((message) => (
                   <div key={message.id} className={`message ${message.type}`}>
                     <div className="message-avatar">
                       {message.type === 'bot' ? (
                         <Bot className="avatar-icon" />
                       ) : (
                         <User className="avatar-icon" />
                       )}
                     </div>
                     <div className="message-content">
                       {message.isProposal ? (
                         <div className="proposal-message">
                           <div className="proposal-message-header">
                             <h4 className="proposal-message-title">{message.proposalData.title}</h4>
                             <button
                               className="copy-btn-message"
                               onClick={() => copyToClipboard(message.proposalData.content, message.id)}
                               title="Copy proposal"
                             >
                               {copiedIndex === message.id ? (
                                 <CheckCircle className="copy-icon-message copied" />
                               ) : (
                                 <Copy className="copy-icon-message" />
                               )}
                             </button>
                           </div>
                           <div className="proposal-message-content">
                             {message.proposalData.content.split('\n').map((line, lineIndex) => (
                               <p key={lineIndex} className="proposal-message-line">
                                 {line}
                               </p>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <div className="message-text">{message.content}</div>
                       )}
                       <div className="message-time">
                         {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                     </div>
                   </div>
                 ))}
                 <div ref={messagesEndRef} />
               </div>

        {/* Input Area */}
        <div className="chat-input-container">
          {/* Template Selection */}
          <div className="template-selection">
            <label className="template-label">Template Type:</label>
            <div className="template-options">
              <button
                className={`template-option ${templateType === 'default' ? 'active' : ''}`}
                onClick={() => setTemplateType('default')}
                disabled={loading}
              >
                <MessageSquare className="template-icon" />
                Default Templates
              </button>
              <button
                className={`template-option ${templateType === 'custom' ? 'active' : ''}`}
                onClick={() => setTemplateType('custom')}
                disabled={loading}
              >
                <Sparkles className="template-icon" />
                Custom AI Generated
              </button>
            </div>
          </div>
          
          <div className="input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Paste your Upwork project description here..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={3}
              disabled={loading}
            />
            <button
              className="generate-button"
              onClick={generateProposals}
              disabled={loading || !projectDescription.trim()}
            >
              {loading ? (
                <Loader className="generate-icon spinning" />
              ) : (
                <Sparkles className="generate-icon" />
              )}
              Generate Proposal
            </button>
          </div>
          <div className="input-footer">
            <span className="char-count">{projectDescription.length} characters</span>
            <span className="shortcut-hint">Press Ctrl+Enter to generate</span>
          </div>
        </div>

               {/* Error Message */}
               {error && (
                 <div className="error-message">
                   <AlertCircle className="error-icon" />
                   {error}
                 </div>
               )}
             </div>
           </div>
         );
       }

export default App;
