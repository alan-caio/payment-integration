import React, { Component } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';

const Index = props => {
  return (
      <Router>
        <App />
      </Router>
  )
}

render(<Index />, document.getElementById('app'));
