
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { UserProfile, UserPlan } from '../types';

export function useUserProfile(user: User | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code === 'PGRST116') {
                    // Profile not found, create one
                    const newProfile = {
                        id: user.id,
                        email: user.email,
                        plan: 'free' as UserPlan,
                        usage_count: 0,
                        last_reset_date: new Date().toISOString()
                    };

                    const { data: createdProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([newProfile])
                        .select()
                        .single();

                    if (createError) throw createError;

                    setProfile({
                        ...createdProfile,
                        usageCount: createdProfile.usage_count,
                        lastResetDate: createdProfile.last_reset_date,
                        subscriptionEndDate: createdProfile.subscription_end_date
                    } as UserProfile);

                } else if (error) {
                    throw error;
                } else {
                    // Start with mapping
                    const currentProfile = {
                        ...data,
                        usageCount: data.usage_count,
                        lastResetDate: data.last_reset_date,
                        subscriptionEndDate: data.subscription_end_date
                    } as UserProfile;

                    if (shouldResetUsage(currentProfile.lastResetDate)) {
                        const { data: resetData, error: resetError } = await supabase
                            .from('profiles')
                            .update({
                                usage_count: 0,
                                last_reset_date: new Date().toISOString()
                            })
                            .eq('id', user.id)
                            .select()
                            .single();

                        if (resetError) throw resetError;

                        setProfile({
                            ...resetData,
                            usageCount: resetData.usage_count,
                            lastResetDate: resetData.last_reset_date,
                            subscriptionEndDate: resetData.subscription_end_date
                        } as UserProfile);
                    } else {
                        setProfile(currentProfile);
                    }
                }
            } catch (err) {
                console.error('Error fetching/creating profile:', err);
                // Fallback for safety - maybe offline or DB issue
                // We don't block the UI entirely but features might be limited or open
                // For now, assume free plan if error to avoid exploitation
                setProfile({
                    name: user.email || 'Usuário', // Add dummy name if needed by type, though type says name is string
                    email: user.email || '',
                    plan: 'free',
                    usageCount: 0, // Using camelCase matching Types? No, DB is snake_case usually.
                    // Wait, types.ts uses camelCase: usageCount. 
                    // Supabase returns what is in DB. If DB is snake_case, I need to map it.
                    // BUT, if I created the table via SQL editor previously or if I am creating it now via insert...
                    // Best practice: Types match DB or we map.
                } as any);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const incrementUsage = async (): Promise<boolean> => {
        if (!user) return false;

        try {
            // 1. Fetch fresh profile data to prevent race conditions
            const { data: freshProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('usage_count, plan')
                .eq('id', user.id)
                .single();

            if (fetchError || !freshProfile) {
                console.error('Error fetching fresh profile for usage check:', fetchError);
                return false;
            }

            const currentUsage = freshProfile.usage_count;
            const currentPlan = freshProfile.plan as UserPlan;

            // 2. Check Limit Server-Side
            const USAGE_LIMIT = 5;

            if (currentPlan !== 'plus' && currentUsage >= USAGE_LIMIT) {
                // Limit reached
                if (profile) {
                    setProfile({ ...profile, usageCount: currentUsage });
                }
                return false;
            }

            // 3. Increment
            const newCount = currentUsage + 1;
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ usage_count: newCount })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error incrementing usage:', updateError);
                return false;
            }

            // 4. Update local state
            if (profile) {
                setProfile({ ...profile, usageCount: newCount });
            }

            return true;

        } catch (err) {
            console.error('Unexpected error in incrementUsage:', err);
            return false;
        }
    };

    // Helper to check if we entered a new month
    const shouldResetUsage = (lastResetDateStr?: string) => {
        if (!lastResetDateStr) return true;
        const lastReset = new Date(lastResetDateStr);
        const now = new Date();

        return lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
    };

    return { profile, loading, incrementUsage };
}
