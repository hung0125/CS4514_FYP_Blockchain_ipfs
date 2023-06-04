import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { EthAccountProvider } from './context/EthContextAccount';
import { PathProvider } from './context/ContextPath';
import { PathSuggesterProvider } from './context/ContextPathSuggester';
import { SharedDataProvider } from './context/ContextSharedData';

ReactDOM.createRoot(document.getElementById('root')).render(
  <SharedDataProvider>
    <EthAccountProvider>
      <PathProvider>
        <PathSuggesterProvider>
          <App />
        </PathSuggesterProvider>
      </PathProvider>
    </EthAccountProvider>
  </SharedDataProvider>
)
