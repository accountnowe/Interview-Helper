// src/components/interviewee/ResumeUpload.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, CheckCircle, Sparkles, FileCheck } from 'lucide-react';
import { ResumeParserService } from '@/services/resumeParser.service';

interface ResumeUploadProps {
    onResumeProcessed: (fileName: string, info: any) => void;
}

export const ResumeUpload = ({ onResumeProcessed }: ResumeUploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setError(null);
        const validation = ResumeParserService.validateFile(selectedFile);

        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) handleFileSelect(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const { info } = await ResumeParserService.parseResume(file);
            onResumeProcessed(file.name, info);
        } catch (err: any) {
            setError(err.message || 'Failed to process resume');
            setFile(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Upload Your Resume
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                Start your AI-powered interview journey
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${isDragging
                            ? 'border-blue-500 bg-blue-50 scale-105'
                            : file
                                ? 'border-green-400 bg-green-50'
                                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleInputChange}
                            className="hidden"
                        />

                        {!file ? (
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                    <Upload className="h-10 w-10 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-base font-medium text-slate-700 mb-2">
                                        Drop your resume here or click to browse
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Supports PDF and DOCX files up to 10MB
                                    </p>
                                </div>
                                <Button
                                    onClick={handleButtonClick}
                                    className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                    <FileCheck className="h-10 w-10 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2 text-base font-semibold text-slate-800">
                                        <FileText className="h-5 w-5 text-green-600" />
                                        {file.name}
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <Button
                                    onClick={handleButtonClick}
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 border-slate-300 hover:bg-slate-100"
                                >
                                    Change File
                                </Button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                            <AlertDescription className="font-medium">{error}</AlertDescription>
                        </Alert>
                    )}

                    {file && !error && (
                        <Button
                            onClick={handleUpload}
                            className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing Resume...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Start Interview
                                </>
                            )}
                        </Button>
                    )}

                    <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border border-blue-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            What happens next?
                        </h4>
                        <ul className="space-y-2.5 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                                <span>Your resume will be analyzed to extract basic information</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                                <span>We'll collect your Name, Email, and Phone Number</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                                <span>The AI interview will begin with 6 carefully curated questions</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};