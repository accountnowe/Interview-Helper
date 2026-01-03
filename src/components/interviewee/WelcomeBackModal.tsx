// src/components/interviewee/WelcomeBackModal.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, RotateCcw, TrendingUp } from 'lucide-react';

interface WelcomeBackModalProps {
    open: boolean;
    candidateName?: string;
    questionsCompleted: number;
    totalQuestions: number;
    onContinue: () => void;
    onStartNew: () => void;
}

export const WelcomeBackModal = ({
    open,
    candidateName,
    questionsCompleted,
    totalQuestions,
    onContinue,
    onStartNew,
}: WelcomeBackModalProps) => {
    const progressPercentage = (questionsCompleted / totalQuestions) * 100;

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">
                                Welcome Back{candidateName ? `, ${candidateName}` : ''}!
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                You have an unfinished interview session
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-5">
                    <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-semibold text-slate-900">Your Progress</span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                                {Math.round(progressPercentage)}%
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Questions Completed</span>
                                <span className="font-bold text-slate-900">{questionsCompleted} of {totalQuestions}</span>
                            </div>
                            <div className="relative w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-lg"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-600">
                                {totalQuestions - questionsCompleted} questions remaining
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                        <p className="text-sm text-amber-800">
                            <span className="font-semibold">Note:</span> Starting a new interview will discard your current progress.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={onStartNew}
                        className="w-full sm:w-auto border-slate-300 hover:bg-slate-100"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Start Fresh
                    </Button>
                    <Button
                        onClick={onContinue}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                    >
                        Continue Interview
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};