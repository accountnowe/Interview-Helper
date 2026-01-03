// src/components/interviewee/QuestionTimer.tsx
import { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertCircle, Zap } from 'lucide-react';
import { formatTime } from '@/utils/helpers';
import { Badge } from '../ui/badge';

interface QuestionTimerProps {
    timeLimit: number;
    onTimeUp: () => void;
    isPaused?: boolean;
}

export const QuestionTimer = ({ timeLimit, onTimeUp, isPaused = false }: QuestionTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const onTimeUpRef = useRef(onTimeUp);

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        setTimeLeft(timeLimit);
    }, [timeLimit]);

    useEffect(() => {
        if (isPaused || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isPaused]);

    useEffect(() => {
        if (timeLeft === 0) {
            onTimeUpRef.current();
        }
    }, [timeLeft]);

    const percentage = ((timeLimit - timeLeft) / timeLimit) * 100;
    const isLowTime = timeLeft <= 10 && timeLeft > 0;
    const isTimeUp = timeLeft === 0;

    return (
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {isTimeUp ? (
                        <div className="p-2 rounded-lg bg-red-100">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                    ) : isLowTime ? (
                        <div className="p-2 rounded-lg bg-orange-100 animate-pulse">
                            <Zap className="h-4 w-4 text-orange-600" />
                        </div>
                    ) : (
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                    )}
                    <div>
                        <span className={`text-lg font-bold ${isTimeUp ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-slate-900'}`}>
                            {isTimeUp ? 'Time Up!' : formatTime(timeLeft)}
                        </span>
                        <p className="text-xs text-slate-500">
                            of {formatTime(timeLimit)} total
                        </p>
                    </div>
                </div>
                {!isTimeUp && (
                    <Badge className={`${isLowTime ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200'} border`}>
                        {Math.round((timeLeft / timeLimit) * 100)}%
                    </Badge>
                )}
            </div>
            <div className="relative">
                <Progress
                    value={percentage}
                    className={`h-2.5 ${isTimeUp ? 'bg-red-100' : isLowTime ? 'bg-orange-100' : 'bg-blue-100'}`}
                />
                {isLowTime && !isTimeUp && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                )}
            </div>
            {isLowTime && !isTimeUp && (
                <p className="text-xs text-orange-600 font-medium animate-pulse flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    Hurry! Only {timeLeft} seconds remaining
                </p>
            )}
        </div>
    );
};
