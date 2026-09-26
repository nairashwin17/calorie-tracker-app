import React, { ReactNode } from 'react';
import { UtensilsCrossed, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { RootState } from '../redux/store';
import { setCurrentDate } from '../redux/trackerSlice';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const currentDate = useSelector((state: RootState) => state.tracker.currentDate);
    const dispatch = useDispatch();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm/50 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <UtensilsCrossed size={20} />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            Calorie Tracker
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => {
                                    const date = new Date(currentDate);
                                    date.setDate(date.getDate() - 1);
                                    dispatch(setCurrentDate(date.toISOString().split('T')[0]));
                                }}
                                className="p-1 hover:bg-white rounded-md transition-colors"
                                title="Previous Day"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-2 px-3 py-1.5 min-w-[140px] justify-center">
                                <Calendar size={16} />
                                <span>{format(new Date(currentDate), 'EEE, MMM do')}</span>
                            </div>
                            <button
                                onClick={() => {
                                    const date = new Date(currentDate);
                                    date.setDate(date.getDate() + 1);
                                    dispatch(setCurrentDate(date.toISOString().split('T')[0]));
                                }}
                                className="p-1 hover:bg-white rounded-md transition-colors"
                                title="Next Day"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
