import React, { useState } from 'react';
import { surveyService, teamService } from '../lib/supabaseService';

const TestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, details = '') => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Load surveys
      addResult('Loading Surveys', 'running');
      try {
        const { data: surveys, error } = await surveyService.getSurveys();
        if (error) {
          addResult('Loading Surveys', 'failed', error.message);
        } else {
          addResult('Loading Surveys', 'passed', `Found ${surveys?.length || 0} surveys`);
        }
      } catch (error) {
        addResult('Loading Surveys', 'failed', error.message);
      }

      // Test 2: Load teams
      addResult('Loading Teams', 'running');
      try {
        const { data: teams, error } = await teamService.getTeams();
        if (error) {
          addResult('Loading Teams', 'failed', error.message);
        } else {
          addResult('Loading Teams', 'passed', `Found ${teams?.length || 0} teams`);
        }
      } catch (error) {
        addResult('Loading Teams', 'failed', error.message);
      }

      // Test 3: Test email API
      addResult('Testing Email API', 'running');
      try {
        const response = await fetch('/api/test-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            surveyTitle: 'Test Survey',
            surveyLink: 'https://lau-ai.vercel.app/survey/test',
            memberName: 'Test Member'
          })
        });
        
        const result = await response.json();
        if (result.success) {
          addResult('Testing Email API', 'passed', 'Email API working');
        } else {
          addResult('Testing Email API', 'failed', result.error);
        }
      } catch (error) {
        addResult('Testing Email API', 'failed', error.message);
      }

      // Test 4: Test survey deletion
      addResult('Testing Survey Deletion', 'running');
      try {
        // Create a test survey first
        const { data: testSurvey, error: createError } = await surveyService.createSurvey({
          title: 'Test Survey for Deletion',
          description: 'This survey will be deleted',
          status: 'draft'
        });

        if (createError) {
          addResult('Testing Survey Deletion', 'failed', `Could not create test survey: ${createError.message}`);
        } else {
          // Now delete it
          const { error: deleteError } = await surveyService.deleteSurvey(testSurvey.id);
          if (deleteError) {
            addResult('Testing Survey Deletion', 'failed', deleteError.message);
          } else {
            addResult('Testing Survey Deletion', 'passed', 'Survey created and deleted successfully');
          }
        }
      } catch (error) {
        addResult('Testing Survey Deletion', 'failed', error.message);
      }

    } catch (error) {
      addResult('Test Suite', 'failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Test Page</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg mb-8"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'passed' 
                  ? 'bg-green-900/20 border-green-500/20 text-green-300'
                  : result.status === 'failed'
                  ? 'bg-red-900/20 border-red-500/20 text-red-300'
                  : 'bg-yellow-900/20 border-yellow-500/20 text-yellow-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold">{result.test}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.status === 'passed' ? 'bg-green-600' :
                  result.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              {result.details && (
                <p className="mt-2 text-sm opacity-80">{result.details}</p>
              )}
              <p className="mt-1 text-xs opacity-60">{result.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage; 