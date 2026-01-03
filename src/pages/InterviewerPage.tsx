// src/pages/InterviewerPage.tsx

import { useState } from 'react';
import { CandidateList } from '@/components/interviewer/CandidateList';
import { CandidateDetail } from '@/components/interviewer/CandidateDetail';

export const InterviewerPage = () => {
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

    const handleSelectCandidate = (id: string) => {
        setSelectedCandidateId(id);
    };

    const handleBackToList = () => {
        setSelectedCandidateId(null);
    };

    if (selectedCandidateId) {
        return (
            <CandidateDetail
                candidateId={selectedCandidateId}
                onBack={handleBackToList}
            />
        );
    }

    return <CandidateList onSelectCandidate={handleSelectCandidate} />;
};