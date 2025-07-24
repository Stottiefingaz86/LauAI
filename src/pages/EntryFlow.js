import React, { useState } from 'react';
import { 
  Upload, 
  Video, 
  FileText, 
  Send,
  ArrowLeft,
  CheckCircle,
  Clock
} from 'lucide-react';

const EntryFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock team members
  const teamMembers = [
    { id: 1, name: 'Sarah Chen', department: 'Design', avatar: 'SC' },
    { id: 2, name: 'Mike Johnson', department: 'Engineering', avatar: 'MJ' },
    { id: 3, name: 'Emma Davis', department: 'Product', avatar: 'ED' },
    { id: 4, name: 'Alex Kim', department: 'Marketing', avatar: 'AK' },
    { id: 5, name: 'David Wilson', department: 'Sales', avatar: 'DW' },
    { id: 6, name: 'Lisa Brown', department: 'Design', avatar: 'LB' }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadedFile({ ...uploadedFile, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setCurrentStep(3);
      
      // Simulate AI analysis
      setTimeout(() => {
        setCurrentStep(3);
      }, 3000);
    }, 2000);
  };

  const getStepStatus = (stepNumber) => {
    if (currentStep > stepNumber) return 'completed';
    if (currentStep === stepNumber) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepNumber) => {
    const status = getStepStatus(stepNumber);
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'active': return <Clock className="w-6 h-6 text-mint" />;
      default: return <div className="w-6 h-6 rounded-full border-2 border-white/30" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="glass-button">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Add 1:1 Entry</h1>
            <p className="text-white/70 mt-1">Upload meeting video or notes for AI analysis</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getStepIcon(1)}
            <div>
              <p className="text-white font-medium">Upload Meeting</p>
              <p className="text-white/60 text-sm">Upload video or notes</p>
            </div>
          </div>
          <div className="flex-1 h-px bg-white/20 mx-4" />
          <div className="flex items-center space-x-4">
            {getStepIcon(2)}
            <div>
              <p className="text-white font-medium">AI Analysis</p>
              <p className="text-white/60 text-sm">Processing signals</p>
            </div>
          </div>
          <div className="flex-1 h-px bg-white/20 mx-4" />
          <div className="flex items-center space-x-4">
            {getStepIcon(3)}
            <div>
              <p className="text-white font-medium">Complete</p>
              <p className="text-white/60 text-sm">Review results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Upload Form */}
      {currentStep === 1 && (
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Upload 1:1 Meeting</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Member Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Team Member</label>
              <select
                value={uploadedFile.memberId}
                onChange={(e) => setUploadedFile({ ...uploadedFile, memberId: e.target.value })}
                className="glass-input w-full"
                required
              >
                <option value="">Select team member</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} • {member.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Meeting Date</label>
              <input
                type="date"
                value={uploadedFile.meetingDate}
                onChange={(e) => setUploadedFile({ ...uploadedFile, meetingDate: e.target.value })}
                className="glass-input w-full"
                required
              />
            </div>

            {/* Upload Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Upload Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="glass-card p-4 cursor-pointer hover:bg-white/25 transition-all duration-200">
                  <input
                    type="radio"
                    name="meetingType"
                    value="video"
                    checked={uploadedFile.meetingType === 'video'}
                    onChange={(e) => setUploadedFile({ ...uploadedFile, meetingType: e.target.value })}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-3">
                    <Video className="w-6 h-6 text-mint" />
                    <div>
                      <p className="text-white font-medium">Video Recording</p>
                      <p className="text-white/60 text-sm">Upload MP4, MOV, or AVI</p>
                    </div>
                  </div>
                </label>
                <label className="glass-card p-4 cursor-pointer hover:bg-white/25 transition-all duration-200">
                  <input
                    type="radio"
                    name="meetingType"
                    value="notes"
                    checked={uploadedFile.meetingType === 'notes'}
                    onChange={(e) => setUploadedFile({ ...uploadedFile, meetingType: e.target.value })}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-mint" />
                    <div>
                      <p className="text-white font-medium">Meeting Notes</p>
                      <p className="text-white/60 text-sm">Paste or upload text</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* File Upload */}
            {uploadedFile.meetingType === 'video' ? (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Upload Video</label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">Drop video file here or click to browse</p>
                  <p className="text-white/40 text-sm">Supports MP4, MOV, AVI up to 500MB</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="glass-button mt-4 cursor-pointer">
                    Choose File
                  </label>
                </div>
                {uploadedFile.file && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-white text-sm">Selected: {uploadedFile.file.name}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Meeting Notes</label>
                <textarea
                  value={uploadedFile.notes}
                  onChange={(e) => setUploadedFile({ ...uploadedFile, notes: e.target.value })}
                  className="glass-input w-full h-32"
                  placeholder="Paste your meeting notes here..."
                  required
                />
              </div>
            )}

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 glass-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload & Analyze'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Analysis */}
      {currentStep === 2 && (
        <div className="glass-card p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-mint animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Analyzing Meeting</h2>
            <p className="text-white/70 mb-6">
              Our AI is processing the meeting content to extract performance signals...
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Extracting key topics</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Analyzing sentiment</span>
                <Clock className="w-5 h-5 text-mint animate-spin" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/60">Generating signals</span>
                <div className="w-5 h-5 rounded-full border-2 border-white/30" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analysis Complete</h2>
              <p className="text-white/70">Meeting with Sarah Chen • January 15, 2024</p>
            </div>

            {/* Signal Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">🟢</div>
                <h3 className="text-white font-semibold">Motivation</h3>
                <p className="text-green-400 text-sm">High energy and enthusiasm</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">🟢</div>
                <h3 className="text-white font-semibold">Impact</h3>
                <p className="text-green-400 text-sm">Clear contributions</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">🟡</div>
                <h3 className="text-white font-semibold">Growth</h3>
                <p className="text-yellow-400 text-sm">Seeking new challenges</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">🟢</div>
                <h3 className="text-white font-semibold">Ownership</h3>
                <p className="text-green-400 text-sm">Takes initiative</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">🟢</div>
                <h3 className="text-white font-semibold">Collaboration</h3>
                <p className="text-green-400 text-sm">Team player</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">🟢</div>
                <h3 className="text-white font-semibold">Well-being</h3>
                <p className="text-green-400 text-sm">Good work-life balance</p>
              </div>
            </div>

            {/* Key Insights */}
            <div className="glass-card p-6">
              <h3 className="text-white font-semibold mb-4">Key Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                  <p className="text-white/80 text-sm">
                    Sarah showed great enthusiasm for the new design challenges and expressed excitement about learning new tools.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
                  <p className="text-white/80 text-sm">
                    Mentioned feeling ready for more complex projects and career advancement opportunities.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
                  <p className="text-white/80 text-sm">
                    Suggested implementing a mentorship program for junior designers.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6">
              <button className="flex-1 glass-button">
                <Send className="w-5 h-5 mr-2" />
                Send to Sarah
              </button>
              <button className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark">
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryFlow; 