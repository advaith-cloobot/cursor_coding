import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getLocker, getLockerDashboard } from '../services/api';

const LockerDashboard = () => {
  const { lockerId } = useParams();
  const navigate = useNavigate();
  const [locker, setLocker] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [lockerId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [lockerData, dashboard] = await Promise.all([
        getLocker(lockerId),
        getLockerDashboard(lockerId),
      ]);
      setLocker(lockerData);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'depositing':
        return 'success';
      case 'withdrawing':
        return 'warning';
      case 'permanently_remove':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTransactionType = (type) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Loading...</Typography>
      </Container>
    );
  }

  if (!locker || !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Locker not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.8)',
            '&:hover': { textDecoration: 'underline', color: 'white' },
          }}
        >
          Home
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/locker/${lockerId}`)}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.8)',
            '&:hover': { textDecoration: 'underline', color: 'white' },
          }}
        >
          {locker.name}
        </Link>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
          Dashboard
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: '#000000' }}>
          {locker.name} - Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/locker/${lockerId}`)}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: 'primary.main',
          }}
        >
          Back to Locker
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: 'rgba(30, 30, 50, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              Total Assets
            </Typography>
            <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              {dashboardData.kpis.total_assets}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: 'rgba(30, 30, 50, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              Withdrawn Assets
            </Typography>
            <Typography variant="h3" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              {dashboardData.kpis.withdrawn_assets}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: 'rgba(30, 30, 50, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
              Currently in Locker
            </Typography>
            <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              {dashboardData.kpis.deposited_assets}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#ffffff', mb: 2, fontWeight: 'bold' }}>
          Recent Activity - Last 10 Transactions
        </Typography>
        {dashboardData.recent_transactions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              No recent transactions
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Asset Name</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Asset Type</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Transaction Type</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.recent_transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {transaction.asset_name || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {transaction.asset_type ? transaction.asset_type.charAt(0).toUpperCase() + transaction.asset_type.slice(1) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatTransactionType(transaction.transaction_type)}
                        color={getTransactionTypeColor(transaction.transaction_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {transaction.reason || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default LockerDashboard;

