// src/components/interviewer/CandidateList.tsx

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '@/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, ArrowUpDown, Eye, Mail, Phone, User } from 'lucide-react';
import { InterviewStatus } from '@/store/types';
import { formatDate, calculatePercentage, getScoreBadgeVariant } from '@/utils/helpers';

interface CandidateListProps {
    onSelectCandidate: (id: string) => void;
}

type SortField = 'name' | 'score' | 'date';
type SortOrder = 'asc' | 'desc';

export const CandidateList = ({ onSelectCandidate }: CandidateListProps) => {
    const { candidates } = useSelector((state: RootState) => state.interview);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('score');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const candidateList = useMemo(() => {
        return Object.values(candidates).filter(
            (c) => c.status === InterviewStatus.COMPLETED
        );
    }, [candidates]);

    const filteredAndSortedCandidates = useMemo(() => {
        const filtered = candidateList.filter((candidate) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                candidate.info.name?.toLowerCase().includes(searchLower) ||
                candidate.info.email?.toLowerCase().includes(searchLower) ||
                candidate.info.phone?.includes(searchTerm)
            );
        });

        filtered.sort((a, b) => {
            let compareValue = 0;

            switch (sortField) {
                case 'name':
                    compareValue = (a.info.name || '').localeCompare(b.info.name || '');
                    break;
                case 'score':
                    compareValue = a.totalScore - b.totalScore;
                    break;
                case 'date':
                    compareValue = a.completedAt! - b.completedAt!;
                    break;
            }

            return sortOrder === 'asc' ? compareValue : -compareValue;
        });

        return filtered;
    }, [candidateList, searchTerm, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
                <p className="text-slate-600 mt-1">
                    View and manage all interviewed candidates
                </p>
            </div>

            <Card className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {filteredAndSortedCandidates.length === 0 ? (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-1">
                            No candidates found
                        </h3>
                        <p className="text-sm text-slate-500">
                            {searchTerm
                                ? 'Try adjusting your search criteria'
                                : 'Completed interviews will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('name')}
                                            className="font-semibold"
                                        >
                                            Candidate
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('score')}
                                            className="font-semibold"
                                        >
                                            Score
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('date')}
                                            className="font-semibold"
                                        >
                                            Date
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedCandidates.map((candidate) => {
                                    const percentage = calculatePercentage(candidate.totalScore, 120);
                                    return (
                                        <TableRow key={candidate.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{candidate.info.name || 'N/A'}</div>
                                                    {candidate.resumeData && (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {candidate.resumeData.fileName}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    {candidate.info.email && (
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <Mail className="h-3 w-3" />
                                                            {candidate.info.email}
                                                        </div>
                                                    )}
                                                    {candidate.info.phone && (
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <Phone className="h-3 w-3" />
                                                            {candidate.info.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getScoreBadgeVariant(percentage)}>
                                                        {candidate.totalScore}/120
                                                    </Badge>
                                                    <span className="text-sm text-slate-600">
                                                        ({percentage}%)
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {formatDate(candidate.completedAt!)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onSelectCandidate(candidate.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>
                        Showing {filteredAndSortedCandidates.length} of {candidateList.length}{' '}
                        completed interviews
                    </div>
                </div>
            </Card>
        </div>
    );
};