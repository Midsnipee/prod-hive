import { supabase } from "@/integrations/supabase/client";

export const seedDemoUsers = async () => {
  try {
    // Check if users already exist
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('email')
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Demo users already seeded');
      return;
    }

    console.log('Seeding demo users via edge function...');

    // Call the edge function to seed demo users
    const { data, error } = await supabase.functions.invoke('seed-demo-users');

    if (error) {
      console.error('Error seeding demo users:', error);
      return;
    }

    console.log('Demo users seeded:', data);
  } catch (error) {
    console.error('Error seeding demo users:', error);
  }
};
