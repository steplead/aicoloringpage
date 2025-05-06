import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少Supabase环境变量。请确保设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY。');
}

// 使用持久化存储
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// 用户认证辅助函数
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (!error && data?.user) {
    // 注册成功后，创建用户的profiles记录
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: data.user.id,
          username: email.split('@')[0],
          updated_at: new Date()
        }
      ]);
      
    if (profileError) {
      console.error('创建用户资料失败:', profileError);
    }
  }
  
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { user: data?.session?.user || null, error };
};

// 用户资料辅助函数
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code === 'PGRST116') {
    // 如果找不到用户资料，自动创建一个
    console.log('尝试创建用户资料:', userId);
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId,
          username: `user_${userId.substring(0, 8)}`,
          updated_at: new Date()
        }
      ])
      .select()
      .single();
      
    if (insertError) {
      console.error('创建用户资料失败:', insertError);
      return { profile: null, error: insertError };
    }
    
    return { profile: newProfile, error: null };
  }
  
  return { profile: data, error };
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
};

// 作品存储辅助函数
export const saveArtwork = async (userId, artworkData) => {
  const { data, error } = await supabase
    .from('artworks')
    .insert([
      { 
        user_id: userId,
        ...artworkData
      }
    ]);
  return { data, error };
};

export const getUserArtworks = async (userId) => {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { artworks: data, error };
};

// 文件存储辅助函数
export const uploadImage = async (bucket, filePath, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  return { data, error };
};

export const getPublicUrl = (bucket, filePath) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}; 