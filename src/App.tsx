import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/Input';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const formSchema = z.object({
  email: z.email({ message: "Por favor, insira um e-mail válido." }),
});

type FormData = z.infer<typeof formSchema>;

function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      await axios.post('/api/subscribe', { email: data.email });
      setStatus('success');
      setMessage('Obrigado! Você foi inscrito com sucesso.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Newsletter Exclusiva
          </h1>
          <p className="text-slate-400">
            Receba dicas semanais sobre desenvolvimento Full-Stack, arquitetura e carreira.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center space-y-2 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
            <h3 className="text-green-400 font-medium text-lg">Inscrição Confirmada!</h3>
            <p className="text-green-200/80 text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              type="email" 
              placeholder="seu@email.com" 
              label="E-mail profissional"
              {...register('email')}
              error={errors.email?.message}
            />

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <button
              disabled={status === 'loading'}
              type="submit"
              className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'loading' ? 'Inscrevendo...' : 'Inscrever-se agora'}
            </button>
            
            <p className="text-xs text-center text-slate-500">
              Zero spam. Cancele a qualquer momento.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;