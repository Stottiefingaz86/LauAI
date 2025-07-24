import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="glass-topnav">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-white">SignalOS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-white/70 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="glass-button bg-mint text-gray-900 hover:bg-mint-dark">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Employee Performance
            <span className="mint-accent block">Intelligence</span>
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
            Transform your 1:1 meetings into actionable insights. SignalOS uses AI to analyze 
            employee performance signals and help you build stronger, more engaged teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="glass-button bg-mint text-gray-900 hover:bg-mint-dark text-lg px-8 py-4"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="glass-button text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything you need to understand your team
          </h2>
          <p className="text-white/70 text-lg">
            From AI-powered insights to comprehensive reporting, SignalOS has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-mint" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">AI Signal Analysis</h3>
            <p className="text-white/70">
              Upload your 1:1 meeting recordings and get instant AI analysis of employee 
              motivation, impact, and engagement signals.
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-mint" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Team Management</h3>
            <p className="text-white/70">
              Organize your team by departments, track individual performance, and identify 
              top performers and areas for improvement.
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-mint" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Smart Surveys</h3>
            <p className="text-white/70">
              Send targeted surveys to individuals or entire departments to gather 
              additional insights and feedback.
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-mint" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Performance Trends</h3>
            <p className="text-white/70">
              Track performance signals over time and identify trends that help you 
              make data-driven decisions.
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-mint" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Privacy First</h3>
            <p className="text-white/70">
              Your data is encrypted and secure. We never share your team's information 
              with third parties.
            </p>
          </div>

          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-mint" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Instant Insights</h3>
            <p className="text-white/70">
              Get real-time alerts and recommendations to help you address issues 
              before they become problems.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass-card p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to transform your team management?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of managers who are already using SignalOS to build stronger, 
            more engaged teams with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="glass-button bg-mint text-gray-900 hover:bg-mint-dark text-lg px-8 py-4"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="glass-button text-lg px-8 py-4">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-white">SignalOS</span>
            </div>
            <div className="flex items-center space-x-6 text-white/60">
              <span>© 2024 SignalOS. All rights reserved.</span>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 