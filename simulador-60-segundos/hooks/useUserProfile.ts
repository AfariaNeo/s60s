
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
                    const rawData = data as any;
                    const now = new Date();
                    let activePlan = rawData.plan;

                    if (rawData.plan === 'plus' && rawData.subscription_end_date) {
                        const expiry = new Date(rawData.subscription_end_date);
                        if (expiry < now) {
                            activePlan = 'free';
                        }
                    }

                    // Smart name resolution
                    const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
                    const profileName = rawData.name;

                    const resolvedName = profileName || metaName || user.email || 'Usuário';

                    // Auto-Repair: If DB name is missing but we have it in metadata, update DB
                    if (!profileName && metaName) {
                        console.log("Auto-Repairing Profile Name...");
                        supabase.from('profiles').update({ name: metaName }).eq('id', user.id).then(({ error }) => {
                            if (error) console.error("Auto-Repair Failed:", error);
                            else console.log("Auto-Repair Success!");
                        });
                    }

                    const currentProfile: UserProfile = {
                        ...data,
                        id: rawData.id ?? user.id,
                        plan: activePlan,
                        usageCount: rawData.usage_count ?? 0,
                        lastResetDate: rawData.last_reset_date,
                        subscriptionEndDate: rawData.subscription_end_date,
                        trialStartedAt: rawData.trial_started_at ?? undefined,
                        createdAt: rawData.created_at ?? undefined,
                        phone: rawData.phone ?? undefined,
                        creciNumber: rawData.creci_number ?? undefined,
                        creciState: rawData.creci_state ?? undefined,
                        name: resolvedName,
                        email: rawData.email || ''
                    } as UserProfile;

                    if (shouldResetUsage(currentProfile.lastResetDate)) {
                        // ... (keep existing reset logic)
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

                        // Map reset data too
                        setProfile({
                            ...resetData,
                            plan: activePlan, // Maintain the calculated plan expiration
                            usageCount: (resetData as any).usage_count ?? 0,
                            lastResetDate: (resetData as any).last_reset_date,
                            subscriptionEndDate: (resetData as any).subscription_end_date,
                            trialStartedAt: (resetData as any).trial_started_at ?? undefined,
                            createdAt: (resetData as any).created_at ?? undefined,
                            name: resolvedName // Keep resolved name
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

    const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
        if (!user) return false;

        try {
            const payload = {
                phone: updates.phone ?? null,
                creci_number: updates.creciNumber ?? null,
                creci_state: updates.creciState ?? null,
                name: updates.name ?? null,
                email: updates.email ?? null,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('profiles')
                .update(payload)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            const rawData = data as any;
            const nextProfile: UserProfile = {
                ...profile,
                id: rawData.id ?? user.id,
                name: rawData.name || profile?.name || user.email || 'Usuário',
                email: rawData.email || user.email || '',
                phone: rawData.phone ?? undefined,
                creciNumber: rawData.creci_number ?? undefined,
                creciState: rawData.creci_state ?? undefined,
                plan: profile?.plan || 'free',
                usageCount: rawData.usage_count ?? profile?.usageCount ?? 0,
                lastResetDate: rawData.last_reset_date ?? profile?.lastResetDate,
                subscriptionEndDate: rawData.subscription_end_date ?? profile?.subscriptionEndDate,
                trialStartedAt: rawData.trial_started_at ?? profile?.trialStartedAt,
                createdAt: rawData.created_at ?? profile?.createdAt,
            };

            setProfile(nextProfile);
            return true;
        } catch (err) {
            console.error('Error updating profile:', err);
            return false;
        }
    };

    const incrementUsage = async (): Promise<{ success: boolean; limitReached: boolean }> => {
        if (!user) return { success: false, limitReached: false };

        try {
            // 1. Fetch fresh profile data to prevent race conditions
            const { data: freshProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('usage_count, plan')
                .eq('id', user.id)
                .single();

            if (fetchError || !freshProfile) {
                console.error('Error fetching fresh profile for usage check:', fetchError);
                return { success: false, limitReached: false };
            }

            const currentUsage = freshProfile.usage_count;

            // 3. Increment
            const newCount = currentUsage + 1;
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ usage_count: newCount })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error incrementing usage:', updateError);
                return { success: false, limitReached: false };
            }

            // 4. Update local state
            if (profile) {
                setProfile({ ...profile, usageCount: newCount });
            }

            return { success: true, limitReached: false };

        } catch (err) {
            console.error('Unexpected error in incrementUsage:', err);
            return { success: false, limitReached: false };
        }
    };

    // Helper to check if we entered a new month
    const shouldResetUsage = (lastResetDateStr?: string) => {
        if (!lastResetDateStr) return true;
        const lastReset = new Date(lastResetDateStr);
        const now = new Date();

        return lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
    };

    const updateTrialStartedAt = async (): Promise<boolean> => {
        if (!user) return false;
        try {
            const now = new Date().toISOString();
            const { error } = await supabase
                .from('profiles')
                .update({ trial_started_at: now })
                .eq('id', user.id);
            if (error) { console.error('Error updating trial_started_at:', error); return false; }
            if (profile) setProfile({ ...profile, trialStartedAt: now });
            return true;
        } catch (err) {
            console.error('Unexpected error in updateTrialStartedAt:', err);
            return false;
        }
    };

    return { profile, loading, incrementUsage, updateTrialStartedAt, updateProfile };
}
