// src/pages/IntervieweePage.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '@/store';
import { ResumeUpload } from '@/components/interviewee/ResumeUpload';
import { ChatInterface } from '@/components/interviewee/ChatInterface';
import { WelcomeBackModal } from '@/components/interviewee/WelcomeBackModal';
import {
    createCandidate,
    setResumeData,
    updateInterviewStatus,
    resetCurrentCandidate,
} from '@/store/slices/candidateSlice';
import { InterviewStatus } from '@/store/types';
import { generateId } from '@/utils/helpers';

export const IntervieweePage = () => {
    const dispatch = useDispatch();
    const { currentCandidateId, candidates } = useSelector((state: RootState) => state.interview);
    const [showWelcomeBack, setShowWelcomeBack] = useState(false);
    const [resumeUploaded, setResumeUploaded] = useState(false);

    const currentCandidate = currentCandidateId ? candidates[currentCandidateId] : null;

    useEffect(() => {
        if (currentCandidateId && currentCandidate) {
            if (
                currentCandidate.status === InterviewStatus.IN_PROGRESS ||
                currentCandidate.status === InterviewStatus.COLLECTING_INFO
            ) {
                setShowWelcomeBack(true);
                setResumeUploaded(true);
            } else if (currentCandidate.status === InterviewStatus.COMPLETED) {
                setResumeUploaded(false);
            } else {
                setResumeUploaded(false);
            }
        }
    }, []);

    const handleResumeProcessed = (fileName: string, info: any) => {
        const candidateId = generateId();

        dispatch(createCandidate({ id: candidateId, info }));
        dispatch(setResumeData({ id: candidateId, fileName }));
        dispatch(updateInterviewStatus({ id: candidateId, status: InterviewStatus.COLLECTING_INFO }));

        setResumeUploaded(true);
    };

    const handleContinueInterview = () => {
        setShowWelcomeBack(false);
    };

    const handleStartNewInterview = () => {
        dispatch(resetCurrentCandidate());
        setShowWelcomeBack(false);
        setResumeUploaded(false);
    };

    if (showWelcomeBack && currentCandidate) {
        return (
            <WelcomeBackModal
                open={showWelcomeBack}
                candidateName={currentCandidate.info.name}
                questionsCompleted={currentCandidate.questions.filter(q => q.answer).length}
                totalQuestions={6}
                onContinue={handleContinueInterview}
                onStartNew={handleStartNewInterview}
            />
        );
    }

    if (!resumeUploaded) {
        return <ResumeUpload onResumeProcessed={handleResumeProcessed} />;
    }

    return <ChatInterface />;
};