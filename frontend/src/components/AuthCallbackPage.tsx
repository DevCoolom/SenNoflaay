import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, insforge } from '../lib/insforge';
import { Shield, AlertCircle } from 'lucide-react';

type Status = 'processing' | 'error';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(window.location.search);

      if (sessionError || !session) throw sessionError ?? new Error('No session returned');

      const authUser = session.user;
      const meta = authUser.user_metadata ?? {};

      if (meta.pending_association_id) {
        await createAssociationAndUser(
          authUser.id,
          authUser.email!,
          meta.pending_association_id,
          meta.pending_association_name,
          meta.pending_username ?? 'Admin',
        );
        navigate(`/app/${meta.pending_association_id}`, { replace: true });
      } else if (meta.invite_token) {
        await claimInviteAfterConfirmation(authUser.id, authUser.email!, meta);
        navigate(`/app/${meta.invite_association_id}`, { replace: true });
      } else {
        // Plain sign-in confirmation — session is established, navigate to app root
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong during email confirmation');
    }
  };

  const createAssociationAndUser = async (
    authId: string,
    email: string,
    assocId: string,
    assocName: string,
    username: string,
  ) => {
    const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

    // Idempotent — skip if association already exists (re-registration or double-click)
    const { data: existingAssoc } = await insforge.database
      .from('associations')
      .select('id')
      .eq('id', assocId)
      .maybeSingle();

    if (!existingAssoc) {
      const { error: assocError } = await insforge.database.from('associations').insert({
        id: assocId,
        name: assocName,
        created_at: new Date().toISOString(),
      });
      if (assocError) throw assocError;

      await insforge.database.from('settings').insert([
        { association_id: assocId, key: 'logo_url', value: '' },
        { association_id: assocId, key: 'app_name', value: assocName },
      ]);
    }

    // Idempotent — skip if user row already exists for this auth_id
    const { data: existingUser } = await insforge.database
      .from('users')
      .select('username')
      .eq('auth_id', authId)
      .maybeSingle();

    if (!existingUser) {
      const { error: userError } = await insforge.database.from('users').insert({
        username: capitalizedUsername,
        association_id: assocId,
        auth_id: authId,
        email,
        role: 'superadmin',
      });
      if (userError) throw userError;
    }
  };

  const claimInviteAfterConfirmation = async (
    authId: string,
    email: string,
    meta: Record<string, any>,
  ) => {
    const { invite_token, invite_association_id } = meta;

    const { data: invite } = await insforge.database
      .from('invites')
      .select('*')
      .eq('token', invite_token)
      .eq('association_id', invite_association_id)
      .eq('used', false)
      .maybeSingle();

    if (!invite || new Date(invite.expires_at) < new Date()) {
      throw new Error('Invite has expired or was already used. Ask an admin for a new one.');
    }

    const username = email.split('@')[0];
    const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

    const { error: userError } = await insforge.database.from('users').insert({
      username: capitalizedUsername,
      association_id: invite_association_id,
      auth_id: authId,
      email,
      role: invite.role,
      member_id: invite.member_id || null,
    });
    if (userError) throw userError;

    await insforge.database.from('invites').update({ used: true }).eq('token', invite_token);
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[2rem] card-shadow w-full max-w-sm border border-slate-100 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Confirmation Failed</h2>
          <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-brand-600" />
        </div>
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Setting up your account...</p>
      </div>
    </div>
  );
}
