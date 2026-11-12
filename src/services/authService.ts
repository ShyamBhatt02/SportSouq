import type { Address, AddressInput, AuthSession, User } from '@/types';
import type { ChangePasswordValues, LoginValues, ProfileValues, RegisterValues } from '@/schemas';
import { api } from './api/client';

export interface AuthResponse {
  user: User;
  session: AuthSession;
}

export const authService = {
  async login(values: LoginValues): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', values);
    return data;
  },
  async register(values: RegisterValues): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', values);
    return data;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },
  async updateProfile(values: ProfileValues & { marketingOptIn?: boolean }): Promise<User> {
    const { data } = await api.patch<User>('/account/profile', values);
    return data;
  },
  async changePassword(values: ChangePasswordValues): Promise<void> {
    await api.post('/account/password', values);
  },
};

export const addressService = {
  async list(): Promise<Address[]> {
    const { data } = await api.get<Address[]>('/account/addresses');
    return data;
  },
  async create(input: AddressInput): Promise<Address> {
    const { data } = await api.post<Address>('/account/addresses', input);
    return data;
  },
  async update(id: string, input: AddressInput): Promise<Address> {
    const { data } = await api.put<Address>('/account/addresses/' + id, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete('/account/addresses/' + id);
  },
  async setDefault(id: string): Promise<Address[]> {
    const { data } = await api.post<Address[]>('/account/addresses/' + id + '/default');
    return data;
  },
};
