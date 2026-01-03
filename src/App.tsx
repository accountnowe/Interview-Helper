// src/App.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntervieweePage } from '@/pages/IntervieweePage';
import { InterviewerPage } from '@/pages/InterviewerPage';
import { UserCircle, LayoutDashboard } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Tabs defaultValue="interviewee" className="h-screen flex flex-col">
        <div className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-2">
            <TabsList className="h-auto w-full grid grid-cols-2 gap-2 rounded-xl bg-slate-100/80 backdrop-blur-sm p-1.5 shadow-inner max-w-2xl mx-auto">
              <TabsTrigger
                value="interviewee"
                className="rounded-lg px-6 py-3.5 text-sm font-medium transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-white/50 flex items-center justify-center gap-2"
              >
                <UserCircle className="h-4 w-4 transition-transform duration-300 data-[state=active]:scale-110" />
                <span className="hidden sm:inline">Interviewee</span>
                <span className="sm:hidden">Candidate</span>
              </TabsTrigger>
              <TabsTrigger
                value="interviewer"
                className="rounded-lg px-6 py-3.5 text-sm font-medium transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-white/50 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4 transition-transform duration-300 data-[state=active]:scale-110" />
                <span className="hidden sm:inline">Interviewer Dashboard</span>
                <span className="sm:hidden">Interviewer</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="interviewee" className="m-0 h-full">
            <IntervieweePage />
          </TabsContent>

          <TabsContent value="interviewer" className="m-0 h-full">
            <InterviewerPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default App;