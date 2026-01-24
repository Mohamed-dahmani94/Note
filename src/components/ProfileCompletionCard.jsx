import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { User, AlertCircle } from 'lucide-react';

const ProfileCompletionCard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [completion, setCompletion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) checkProfileCompletion();
    }, [user]);

    const checkProfileCompletion = async () => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Define required fields for profile completion
            const requiredFields = [
                'full_name',
                'birth_date',
                'birth_place',
                'nationality',
                'id_card_number',
                'id_card_type',
                'address',
                'phone',
                'profession',
                'professional_status',
                'last_degree',
                'specialty'
            ];

            const completedFields = requiredFields.filter(field => {
                const value = profile[field];
                return value && value.toString().trim() !== '';
            });

            const percentage = Math.round((completedFields.length / requiredFields.length) * 100);

            setCompletion({
                percentage,
                completedCount: completedFields.length,
                totalCount: requiredFields.length,
                missingFields: requiredFields.filter(f => !completedFields.includes(f))
            });

        } catch (err) {
            console.error("Error checking profile:", err);
        } finally {
            setLoading(false);
        }
    };

    // Don't show if loading or 100% complete
    if (loading || !completion || completion.percentage === 100) return null;

    const getColorClass = () => {
        if (completion.percentage >= 75) return 'text-green-600 bg-green-50 border-green-200';
        if (completion.percentage >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getProgressColor = () => {
        if (completion.percentage >= 75) return 'bg-green-500';
        if (completion.percentage >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div
            onClick={() => navigate(user?.app_metadata?.role === 'admin' ? '/admin/profile' : '/author/profile')}
            className={`${getColorClass()} p-6 rounded-2xl border-2 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]`}
        >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Complétez votre profil</h3>
                        <span className="text-2xl font-bold">{completion.percentage}%</span>
                    </div>
                    <p className="text-sm opacity-90 mb-4">
                        {completion.completedCount}/{completion.totalCount} informations remplies
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                        <div
                            className={`${getProgressColor()} h-full transition-all duration-500 rounded-full`}
                            style={{ width: `${completion.percentage}%` }}
                        />
                    </div>

                    <p className="text-xs mt-3 opacity-75">
                        👉 Cliquez pour compléter vos informations
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionCard;
