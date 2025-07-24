import React, { useState, useRef } from 'react';
import { Upload, FileVideo, ArrowLeft, CheckCircle } from 'lucide-react';
import { meetingService, storageService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const EntryFlow = () => {
  const [uploadStep, setUploadStep] = useState(1);
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    participants: [],
    recordingFile: null,
    duration: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef();
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setUploadError('Please select a valid video file');
        return;
      }

      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setUploadError('File size must be less than 500MB');
        return;
      }

      setMeetingData(prev => ({
        ...prev,
        recordingFile: file
      }));
      setUploadError('');
      setUploadStep(2);
    }
  };

  const handleInputChange = (field, value) => {
    setMeetingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = async () => {
    if (!meetingData.recordingFile || !meetingData.title) {
      setUploadError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${meetingData.recordingFile.name}`;
      const filePath = `meetings/${user.id}/${fileName}`;

      const { error: uploadError } = await storageService.uploadFile(
        'recordings',
        filePath,
        meetingData.recordingFile
      );

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(50);

      // Get public URL
      const publicUrl = storageService.getPublicUrl('recordings', filePath);

      // Create meeting record in database
      const meetingRecord = {
        title: meetingData.title,
        description: meetingData.description,
        recording_url: publicUrl,
        duration: meetingData.duration || 0,
        participants: meetingData.participants,
        team_id: null, // Will be set based on user's team
        uploaded_by: user.id
      };

      const { data: meeting, error: meetingError } = await meetingService.uploadMeeting(meetingRecord);

      if (meetingError) {
        throw new Error(`Failed to create meeting record: ${meetingError.message}`);
      }

      setUploadProgress(100);
      setUploadSuccess(true);
      setUploadStep(3);

      // The database trigger will automatically call the analyze-meeting edge function
      console.log('Meeting uploaded successfully. Analysis will be triggered automatically.');

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setMeetingData({
      title: '',
      description: '',
      participants: [],
      recordingFile: null,
      duration: 0
    });
    setUploadStep(1);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload 1:1 Meeting</h1>
          <p className="text-muted">Record and analyze your team meetings for insights</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  uploadStep >= step 
                    ? 'bg-mint text-black' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {step === 1 && <Upload className="w-5 h-5" />}
                  {step === 2 && <FileVideo className="w-5 h-5" />}
                  {step === 3 && <CheckCircle className="w-5 h-5" />}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    uploadStep > step ? 'bg-mint' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: File Selection */}
        {uploadStep === 1 && (
          <div className="glass-card p-8 text-center">
            <FileVideo className="w-16 h-16 text-mint mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Select Recording</h2>
            <p className="text-muted mb-6">
              Upload your 1:1 meeting recording for AI analysis
            </p>
            
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="glass-button px-8 py-3 text-lg"
              >
                Choose Video File
              </button>
              <p className="text-sm text-muted mt-4">
                Supported formats: MP4, MOV, AVI (Max 500MB)
              </p>
            </div>

            {uploadError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Meeting Details */}
        {uploadStep === 2 && (
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Meeting Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meetingData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="glass-input w-full"
                  placeholder="e.g., Weekly 1:1 with Sarah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={meetingData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="glass-textarea w-full"
                  rows={3}
                  placeholder="Brief description of the meeting..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={meetingData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  className="glass-input w-full"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Participants
                </label>
                <input
                  type="text"
                  value={meetingData.participants.join(', ')}
                  onChange={(e) => handleInputChange('participants', e.target.value.split(',').map(p => p.trim()))}
                  className="glass-input w-full"
                  placeholder="Enter participant names separated by commas"
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  onClick={() => setUploadStep(1)}
                  className="glass-button-secondary px-6 py-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !meetingData.title}
                  className="glass-button px-8 py-2 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload & Analyze'}
                </button>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-mint h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted mt-2">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {uploadStep === 3 && (
          <div className="glass-card p-8 text-center">
            <CheckCircle className="w-16 h-16 text-mint mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Upload Complete!</h2>
            <p className="text-muted mb-6">
              Your meeting has been uploaded and is being analyzed by AI.
              You'll receive insights and recommendations shortly.
            </p>
            
            <div className="bg-mint/10 border border-mint/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">What happens next?</h3>
              <ul className="text-sm text-muted space-y-2">
                <li>• AI analysis of meeting content and sentiment</li>
                <li>• Performance insights and recommendations</li>
                <li>• Action items and follow-up suggestions</li>
                <li>• Updated team member signals and metrics</li>
              </ul>
            </div>

            <button
              onClick={resetForm}
              className="glass-button px-8 py-3"
            >
              Upload Another Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryFlow; 