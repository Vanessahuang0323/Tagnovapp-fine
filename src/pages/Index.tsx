import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, BarChart3, Target, Mic, Upload, FileText, CheckCircle, AlertCircle, X, Eye, Sparkles, Languages } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { Logo } from "@/components/Logo";

type ProcessingStep = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
};

interface MatchingJob {
  id: string;
  title: string;
  company: string;
  location: string;
}

interface AnalysisPreview {
  coreSkills: string[];
  experience: string[];
  education: string[];
  matchingJobs: MatchingJob[];
}

const Index: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [fileError, setFileError] = useState<string>('');
  const [analysisPreview, setAnalysisPreview] = useState<AnalysisPreview | null>(null);
  const [language, setLanguage] = useState<'zh' | 'en'>(() => {
    return (localStorage.getItem('language') as 'zh' | 'en') || 'zh';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Language content
  const content = {
    zh: {
      title: "AI Talent Matching Platform",
      subtitle: "AI-powered semantic analysis and CRM matching to connect talents with the right opportunities.",
      analyzerTitle: "AI Resume Analyzer",
      analyzerSubtitle: "Upload your resume and get personalized job recommendations with detailed analysis!",
      uploadPrompt: "點擊或拖拽上傳履歷",
      supportedFormats: `支援 PDF, DOC, DOCX, TXT, RTF (最大 ${Math.round(10)}MB)`,
      fileError: "檔案錯誤",
      fileSelected: "檔案已選擇",
      formatCorrect: "格式正確",
      sizeAppropriate: "大小適當",
      processing: "處理進度",
      analysisComplete: "分析完成！",
      foundJobs: "找到",
      jobsUnit: "個適合的職位",
      processingFailed: "處理失敗",
      processingError: "履歷分析過程中發生錯誤，請重試。",
      analyzing: "AI 分析中...",
      startAnalysis: "開始 AI 分析並尋找職位",
      uploadResume: "上傳履歷開始分析",
      analysisPreview: "分析預覽",
      coreSkills: "核心技能:",
      experience: "經驗:",
      education: "學歷:",
      matchingJobs: "匹配職位:",
      companyButton: "I'm a Company",
      studentButton: "I'm a Student",
      platformStats: "Platform Statistics",
      activeUsers: "Active Users",
      companies: "Companies",
      matchRate: "Match Rate",
      unsupportedFormat: "不支援的檔案格式。請上傳",
      fileTooLarge: "檔案大小超過限制",
      processingSteps: {
        upload: { title: "檔案上傳", description: "正在上傳您的履歷檔案..." },
        extract: { title: "AI 內容解析", description: "提取履歷中的關鍵資訊..." },
        analyze: { title: "技能分析", description: "分析您的專業技能和經驗..." },
        match: { title: "職位匹配", description: "尋找最適合的工作機會..." },
        results: { title: "生成結果", description: "準備個人化的職位推薦..." }
      },
      features: {
        resume: { title: "AI Resume Analysis", subtitle: "Deep learning extraction of skills and potential" },
        matching: { title: "Smart Job Matching", subtitle: "Precisely match with semantic tag analysis" },
        interview: { title: "Mock Interview Practice", subtitle: "AI-generated questions with real-time feedback" }
      }
    },
    en: {
      title: "AI Talent Matching Platform",
      subtitle: "AI-powered semantic analysis and CRM matching to connect talents with the right opportunities.",
      analyzerTitle: "AI Resume Analyzer",
      analyzerSubtitle: "Upload your resume and get personalized job recommendations with detailed analysis!",
      uploadPrompt: "Click or drag to upload resume",
      supportedFormats: `Supports PDF, DOC, DOCX, TXT, RTF (Max ${Math.round(10)}MB)`,
      fileError: "File Error",
      fileSelected: "File Selected",
      formatCorrect: "Correct Format",
      sizeAppropriate: "Appropriate Size",
      processing: "Processing Progress",
      analysisComplete: "Analysis Complete!",
      foundJobs: "Found",
      jobsUnit: "matching positions",
      processingFailed: "Processing Failed",
      processingError: "An error occurred during resume analysis, please try again.",
      analyzing: "AI Analyzing...",
      startAnalysis: "Start AI Analysis & Find Jobs",
      uploadResume: "Upload Resume to Start Analysis",
      analysisPreview: "Analysis Preview",
      coreSkills: "Core Skills:",
      experience: "Experience:",
      education: "Education:",
      matchingJobs: "Matching Jobs:",
      companyButton: "I'm a Company",
      studentButton: "I'm a Student",
      platformStats: "Platform Statistics",
      activeUsers: "Active Users",
      companies: "Companies",
      matchRate: "Match Rate",
      unsupportedFormat: "Unsupported file format. Please upload",
      fileTooLarge: "File size exceeds limit",
      processingSteps: {
        upload: { title: "File Upload", description: "Uploading your resume file..." },
        extract: { title: "AI Content Parsing", description: "Extracting key information from resume..." },
        analyze: { title: "Skills Analysis", description: "Analyzing your professional skills and experience..." },
        match: { title: "Job Matching", description: "Finding the best job opportunities..." },
        results: { title: "Generate Results", description: "Preparing personalized job recommendations..." }
      },
      features: {
        resume: { title: "AI Resume Analysis", subtitle: "Deep learning extraction of skills and potential" },
        matching: { title: "Smart Job Matching", subtitle: "Precisely match with semantic tag analysis" },
        interview: { title: "Mock Interview Practice", subtitle: "AI-generated questions with real-time feedback" }
      }
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_FORMATS = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'application/rtf': '.rtf'
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or GIF file",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const isValid = validateFile(file);
    if (!isValid) {
      // validateFile already shows toast messages, so just return.
      return;
    }

    setSelectedFile(file);
    setFileError('');
    toast({
      title: content[language].fileSelected,
      description: `${file.name} (${formatFileSize(file.size)})`,
    });
  }, [toast, content, language, validateFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError('');
    setAnalysisPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initializeProcessingSteps = (): ProcessingStep[] => [
    { id: "upload", title: content[language].processingSteps.upload.title, description: content[language].processingSteps.upload.description, status: 'pending', progress: 0 },
    { id: "extract", title: content[language].processingSteps.extract.title, description: content[language].processingSteps.extract.description, status: 'pending', progress: 0 },
    { id: "analyze", title: content[language].processingSteps.analyze.title, description: content[language].processingSteps.analyze.description, status: 'pending', progress: 0 },
    { id: "match", title: content[language].processingSteps.match.title, description: content[language].processingSteps.match.description, status: 'pending', progress: 0 },
    { id: "results", title: content[language].processingSteps.results.title, description: content[language].processingSteps.results.description, status: 'pending', progress: 0 }
  ];

  const simulateFileProcessing = async () => {
    setIsUploading(true);
    setFileError('');
    setAnalysisPreview(null);
    const steps = initializeProcessingSteps();
    setProcessingSteps(steps);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < steps.length; i++) {
      let currentStep: ProcessingStep = { ...steps[i], status: 'processing' };
      setProcessingSteps(prev => prev.map(s => s.id === currentStep.id ? currentStep : s));
      setUploadProgress((i + 1) * (100 / steps.length));
      await delay(500); // Simulate network or processing delay

      if (Math.random() < 0.1 && i > 0) { // Simulate random error after first step
        currentStep = { ...currentStep, status: 'error' };
        setProcessingSteps(prev => prev.map(s => s.id === currentStep.id ? currentStep : s));
        setFileError(content[language].processingFailed);
        toast({
          title: content[language].processingFailed,
          description: content[language].processingError,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      currentStep = { ...currentStep, status: 'completed', progress: 100 };
      setProcessingSteps(prev => prev.map(s => s.id === currentStep.id ? currentStep : s));
    }
    setUploadProgress(100);
    setIsUploading(false);
    toast({
      title: content[language].analysisComplete,
      description: content[language].foundJobs + " 50 " + content[language].jobsUnit,
    });
    setAnalysisPreview({
      coreSkills: ["React", "TypeScript", "Node.js", "AI/ML", "Cloud Computing"],
      experience: ["5 years as Software Engineer at Google", "3 years as Senior Developer at Microsoft"],
      education: ["M.Sc. Computer Science, Stanford University", "B.Sc. Software Engineering, Tsinghua University"],
      matchingJobs: [
        { id: "1", title: "Senior AI Engineer", company: "Tech Solutions", location: "Taipei" },
        { id: "2", title: "Full Stack Developer", company: "Web Innovations", location: "Hsinchu" },
        { id: "3", title: "Cloud Architect", company: "Data Horizons", location: "Taichung" },
      ]
    });
  };

  const handleFindJobs = async () => {
    if (selectedFile) {
      await simulateFileProcessing();
    } else {
      setFileError(content[language].uploadResume);
      toast({
        title: content[language].fileError,
        description: content[language].uploadResume,
        variant: "destructive",
      });
    }
  };

  const previewFile = () => {
    // Logic to preview selected file (e.g., open in a new tab for PDF/image)
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      window.open(fileURL, '_blank');
      URL.revokeObjectURL(fileURL); // Clean up
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile) {
      await handleFindJobs();
    } else {
      setFileError(content[language].uploadResume);
      toast({
        title: content[language].fileError,
        description: content[language].uploadResume,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <header className="relative w-full py-4 px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Logo />
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            aria-label={t('common.language')}
            title={t('common.language')}
          >
            <Languages className="h-5 w-5 mr-2" />
            {language === 'zh' ? 'English' : '中文'}
          </Button>
        </div>
        <nav className="flex space-x-4">
          <Button variant="ghost" onClick={() => navigate('/company/register')}>{t('home.cta.companyButton')}</Button>
          <Button variant="ghost" onClick={() => navigate('/student/register')}>{t('home.cta.studentButton')}</Button>
          <Button variant="default" onClick={() => navigate('/login')}>{t('common.login')}</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-20 px-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="url(#gridPattern)">
            <defs>
              <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 L 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#gridPattern)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">{t('home.title')}</h1>
          <p className="text-xl mb-8 opacity-90">{t('home.subtitle')}</p>
          <div className="flex space-x-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 transition-colors" onClick={() => navigate('/student/mock-interview')}>{t('home.cta.primary')}</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 transition-colors" onClick={() => navigate('/about')}>{t('home.cta.secondary')}</Button>
          </div>
        </div>
      </section>

      {/* AI Resume Analyzer Section */}
      <section className="w-full py-16 px-6 bg-gray-50 flex flex-col items-center">
        <Card className="w-full max-w-5xl shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">{t('home.analyzerTitle')}</CardTitle>
            <CardDescription className="text-lg text-gray-600">{t('home.analyzerSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleInputChange}
                accept={Object.values(ACCEPTED_FORMATS).join(',')}
              />
              {!selectedFile ? (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-gray-700">{t('home.uploadPrompt')}</p>
                  <p className="text-sm text-gray-500">{t('home.supportedFormats')}</p>
                  <Button variant="outline" className="mt-4" onClick={handleUploadClick}>
                    {t('home.uploadResume')}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                  <p className="mb-2 font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  <div className="mt-4 flex space-x-2">
                    <Badge variant={fileError ? "destructive" : "secondary"}>
                      {fileError ? <AlertCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      {fileError ? t('home.fileError') : t('home.formatCorrect')}
                    </Badge>
                    <Badge variant="secondary">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t('home.sizeAppropriate')}
                    </Badge>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" onClick={removeFile}>
                      <X className="h-4 w-4 mr-2" /> {t('common.cancel')}
                    </Button>
                    <Button onClick={handleFindJobs} disabled={isUploading || !!fileError}>
                      <Sparkles className="h-4 w-4 mr-2" /> {t('home.startAnalysis')}
                    </Button>
                  </div>
                </div>
              )}
              {fileError && (
                <p className="text-red-500 text-sm mt-2">{fileError}</p>
              )}
            </div>

            {isUploading && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">{t('home.processing')}: {uploadProgress.toFixed(0)}%</h3>
                <Progress value={uploadProgress} className="w-full" />
                <div className="mt-4 space-y-2">
                  {processingSteps.map(step => (
                    <div key={step.id} className="flex items-center">
                      {step.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                      {step.status === 'processing' && <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                      {step.status === 'pending' && <span className="h-5 w-5 mr-2"></span>}
                      {step.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500 mr-2" />}
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="text-sm text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisPreview && (
              <Card className="mt-8 p-6 shadow-md rounded-lg bg-gray-100">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{t('home.analysisPreview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">{t('home.coreSkills')}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysisPreview.coreSkills.map((skill, index) => (
                      <Badge key={index} variant="default">{skill}</Badge>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('home.experience')}</h3>
                  <ul className="list-disc list-inside mb-4">
                    {analysisPreview.experience.map((exp, index) => (
                      <li key={index}>{exp}</li>
                    ))}
                  </ul>
                  <h3 className="text-lg font-semibold mb-2">{t('home.education')}</h3>
                  <ul className="list-disc list-inside mb-4">
                    {analysisPreview.education.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))}
                  </ul>
                  <h3 className="text-lg font-semibold mb-2">{t('home.matchingJobs')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisPreview.matchingJobs.map((job, index) => (
                      <Card key={index} className="p-4 flex flex-col">
                        <h4 className="font-semibold text-blue-600">{job.title}</h4>
                        <p className="text-sm text-gray-700">{job.company} - {job.location}</p>
                      </Card>
                    ))}
                  </div>
                  <Button className="mt-6 w-full" onClick={() => navigate('/student/mock-interview')}>
                    {t('home.cta.primary')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 px-6 bg-gray-100">
        <h2 className="text-4xl font-bold text-center mb-12">{t('home.features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="flex flex-col items-center text-center p-6 shadow-md rounded-lg">
            <Search className="h-16 w-16 text-blue-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">{t('home.features.resume.title')}</CardTitle>
            <CardDescription>{t('home.features.resume.subtitle')}</CardDescription>
          </Card>
          <Card className="flex flex-col items-center text-center p-6 shadow-md rounded-lg">
            <BarChart3 className="h-16 w-16 text-purple-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">{t('home.features.matching.title')}</CardTitle>
            <CardDescription>{t('home.features.matching.subtitle')}</CardDescription>
          </Card>
          <Card className="flex flex-col items-center text-center p-6 shadow-md rounded-lg">
            <Mic className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">{t('home.features.interview.title')}</CardTitle>
            <CardDescription>{t('home.features.interview.subtitle')}</CardDescription>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <h2 className="text-4xl font-bold text-center mb-12">{t('home.platformStats')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
          <div>
            <p className="text-5xl font-extrabold mb-2">100K+</p>
            <p className="text-lg opacity-90">{t('home.activeUsers')}</p>
          </div>
          <div>
            <p className="text-5xl font-extrabold mb-2">500+</p>
            <p className="text-lg opacity-90">{t('home.companies')}</p>
          </div>
          <div>
            <p className="text-5xl font-extrabold mb-2">95%</p>
            <p className="text-lg opacity-90">{t('home.matchRate')}</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 px-6 bg-gray-800 text-white text-center">
        <p>&copy; 2024 TagNova. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
