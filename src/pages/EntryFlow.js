import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileVideo, ArrowLeft, CheckCircle, Users, Search, ChevronDown } from 'lucide-react';
import { meetingService, storageService, teamService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const EntryFlow = () => {
  const [uploadStep, setUploadStep] = useState(1);
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    participants: [],
    recordingFile: null,
    duration: 0,
    selectedTeam: null,
    selectedMember: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef();
  const { user } = useAuth();

  // Load teams and members on component mount
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const { data, error } = await teamService.getTeams();
      if (error) {
        console.error('Error loading teams:', error);
      } else {
        setTeams(data || []);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadMembers = async (teamId) => {
    try {
      setLoadingMembers(true);
      const { data, error } = await teamService.getTeamMembers(teamId);
      if (error) {
        console.error('Error loading members:', error);
      } else {
        setMembers(data || []);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleTeamSelect = (team) => {
    setMeetingData(prev => ({
      ...prev,
      selectedTeam: team,
      selectedMember: null // Reset member when team changes
    }));
    setShowTeamDropdown(false);
    loadMembers(team.id);
  };

  const handleMemberSelect = (member) => {
    setMeetingData(prev => ({
      ...prev,
      selectedMember: member
    }));
    setShowMemberDropdown(false);
  };

  const getFilteredMembers = () => {
    if (!searchTerm.trim()) return members;
    return members.filter(member => 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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
        team_id: meetingData.selectedTeam?.id,
        member_id: meetingData.selectedMember?.id,
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
      duration: 0,
      selectedTeam: null,
      selectedMember: null
    });
    setUploadStep(1);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadError('');
    setSearchTerm('');
    setShowTeamDropdown(false);
    setShowMemberDropdown(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload 1:1 Meeting</h1>
          <p className="text-gray-400">Record and analyze your team meetings for insights</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  uploadStep >= step 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500' 
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                  {step === 1 && <Upload className="w-5 h-5" />}
                  {step === 2 && <FileVideo className="w-5 h-5" />}
                  {step === 3 && <CheckCircle className="w-5 h-5" />}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full ${
                    uploadStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: File Selection */}
        {uploadStep === 1 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-10 text-center">
            <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileVideo className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">Select Recording</h2>
            <p className="text-gray-400 mb-8">
              Upload your 1:1 meeting recording for AI analysis
            </p>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 mb-6 hover:border-blue-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Video File
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Supported formats: MP4, MOV, AVI (Max 500MB)
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-4 mb-2">
              <h3 className="text-white font-medium mb-2">What happens after upload?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">1</span>
                  </div>
                  <span>AI analyzes meeting content</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 text-xs font-bold">2</span>
                  </div>
                  <span>Generates performance insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 text-xs font-bold">3</span>
                  </div>
                  <span>Updates team member signals</span>
                </div>
              </div>
            </div>
            {uploadError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300 mt-4">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Meeting Details */}
        {uploadStep === 2 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-10">
            <h2 className="text-2xl font-semibold text-white mb-6">Meeting Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meetingData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Weekly 1:1 with Sarah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={meetingData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the meeting..."
                />
              </div>
              {/* Team Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Team *
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-left flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <span className={meetingData.selectedTeam ? 'text-white' : 'text-white/50'}>
                      {meetingData.selectedTeam ? meetingData.selectedTeam.name : 'Choose a team...'}
                    </span>
                    <ChevronDown size={16} className="text-white/50" />
                  </button>
                  {showTeamDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto z-10">
                      {loadingTeams ? (
                        <div className="p-4 text-center">
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-400 text-sm mt-2">Loading teams...</p>
                        </div>
                      ) : teams.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-gray-400 text-sm">No teams available</p>
                        </div>
                      ) : (
                        teams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => handleTeamSelect(team)}
                            className="w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                          >
                            <div className="text-white font-medium">{team.name}</div>
                            <div className="text-gray-400 text-sm">{team.description || 'No description'}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Team Member *
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    disabled={!meetingData.selectedTeam}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-left flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <span className={meetingData.selectedMember ? 'text-white' : 'text-white/50'}>
                      {meetingData.selectedMember ? meetingData.selectedMember.name : 'Choose a team member...'}
                    </span>
                    <ChevronDown size={16} className="text-white/50" />
                  </button>
                  {showMemberDropdown && meetingData.selectedTeam && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto z-10">
                      {/* Search Bar */}
                      <div className="p-3 border-b border-gray-700">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      {loadingMembers ? (
                        <div className="p-4 text-center">
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-400 text-sm mt-2">Loading members...</p>
                        </div>
                      ) : getFilteredMembers().length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-gray-400 text-sm">
                            {searchTerm ? 'No members found' : 'No members in this team'}
                          </p>
                        </div>
                      ) : (
                        getFilteredMembers().map((member) => (
                          <button
                            key={member.id}
                            onClick={() => handleMemberSelect(member)}
                            className="w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {member.name?.charAt(0) || 'M'}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{member.name}</div>
                                <div className="text-gray-400 text-sm">{member.email}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={meetingData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Participants
                </label>
                <input
                  type="text"
                  value={meetingData.participants.join(', ')}
                  onChange={(e) => handleInputChange('participants', e.target.value.split(',').map(p => p.trim()))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter additional participant names separated by commas"
                />
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <button
                  onClick={() => setUploadStep(1)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !meetingData.title || !meetingData.selectedTeam || !meetingData.selectedMember}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? 'Uploading...' : 'Upload & Analyze'}
                </button>
              </div>
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
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
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-10 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Upload Complete!</h2>
            <p className="text-gray-400 mb-6">
              Your meeting has been uploaded and is being analyzed by AI.
              You'll receive insights and recommendations shortly.
            </p>
            <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• AI analysis of meeting content and sentiment</li>
                <li>• Performance insights and recommendations</li>
                <li>• Action items and follow-up suggestions</li>
                <li>• Updated team member signals and metrics</li>
              </ul>
            </div>
            <button
              onClick={resetForm}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200"
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