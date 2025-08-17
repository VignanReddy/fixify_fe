import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import Landing from './Landing';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsLoading(true);
    
    // Simulate Google OAuth flow
    // In a real app, this would integrate with Google OAuth or your authentication provider
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onSignOut={handleSignOut} 
      />
      <Landing 
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onNavigateToDashboard={handleNavigateToDashboard}
      />
    </div>
  );
};

export default Index;
