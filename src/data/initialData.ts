import { User, Report } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u_admin_1',
    name: 'Rafii Nur Akmal, S.Kom.',
    email: 'admin@smpialazhar44.sch.id',
    role: 'admin',
    nisNip: '198001012005011001',
    phone: '081283798917',
    status: 'approved',
    password: 'smpia44@if'
  }
];

export const INITIAL_REPORTS: Report[] = [];

export const REFLECTION_OPTIONS = [
  {
    id: 'opt1',
    label: 'Saya sudah memahami kegiatan ini.',
    description: 'Dapat melalukan praktik secara mandiri dan percaya diri.',
    iconName: 'Smile'
  },
  {
    id: 'opt2',
    label: 'Saya masih perlu berlatih lagi.',
    description: 'Sudah paham konsep dasar namun perlu konsistensi.',
    iconName: 'RefreshCw'
  },
  {
    id: 'opt3',
    label: 'Saya membutuhkan bantuan guru.',
    description: 'Masih mengalami kendala teknis dan butuh bimbingan.',
    iconName: 'HelpCircle'
  },
  {
    id: 'opt4',
    label: 'Saya ingin mencoba lagi dengan cara berbeda.',
    description: 'Ingin berkreasi dengan metode atau variasi baru.',
    iconName: 'Sparkles'
  }
];
