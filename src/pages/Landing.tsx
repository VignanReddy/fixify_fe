import { AuthButton } from '@/components/AuthButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Video, 
  Shield, 
  Clock, 
  CheckCircle, 
  Camera, 
  FileText, 
  ArrowRight 
} from 'lucide-react';

interface LandingProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onNavigateToDashboard: () => void;
}

const Landing = ({ isAuthenticated, onSignIn, onNavigateToDashboard }: LandingProps) => {
  const features = [
    {
      icon: Camera,
      title: 'Easy Video Recording',
      description: 'Record problems directly from your browser using your device camera'
    },
    {
      icon: FileText,
      title: 'Detailed Descriptions',
      description: 'Add context and descriptions to help with problem analysis'
    },
    {
      icon: Clock,
      title: 'Quick Submission',
      description: 'Submit reports instantly and track their status in real-time'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your videos and data are protected with enterprise-grade security'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Sign In',
      description: 'Use your Google account for quick and secure access'
    },
    {
      number: 2,
      title: 'Record Video',
      description: 'Show the problem area clearly with your device camera'
    },
    {
      number: 3,
      title: 'Add Description',
      description: 'Provide details about the residential issue'
    },
    {
      number: 4,
      title: 'Submit Report',
      description: 'Send for analysis and track the status'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Video className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Report Residential Problems
              <span className="block text-primary">with Video</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Easily document and submit plumbing, furniture, and other residential issues 
              using video reports. Get professional analysis and resolution guidance.
            </p>
          </div>

          {isAuthenticated ? (
            <div className="space-y-4">
              <Button onClick={onNavigateToDashboard} variant="hero" size="lg">
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Welcome back! Start recording a new report or check your existing ones.
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <AuthButton onSignIn={onSignIn} />
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Video Reports?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Video documentation provides clear visual context that helps service professionals 
              understand and resolve your residential problems more effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-card transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Simple 4-step process to submit your residential problem reports
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our platform to document and resolve 
            their residential problems efficiently.
          </p>
          
          {!isAuthenticated && (
            <div className="max-w-md mx-auto">
              <AuthButton onSignIn={onSignIn} />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Video className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">ResidentialReports</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ResidentialReports. Making property maintenance easier through video documentation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;