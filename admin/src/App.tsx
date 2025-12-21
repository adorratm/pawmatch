import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Pets from './pages/Pets';
import Matches from './pages/Matches';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6a3f2a',
    },
    secondary: {
      main: '#82543e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/matches" element={<Matches />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
